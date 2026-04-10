import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SIGNED_URL_PROVIDER } from './signed-url.token.js';

interface CacheEntry {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 4 * 60 * 1000; // 4 min (signed URLs last 5 min)

@Pipe({ name: 'signedUrl', standalone: true, pure: false })
export class SignedUrlPipe implements PipeTransform, OnDestroy {
  private readonly provider = inject(SIGNED_URL_PROVIDER);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  private currentKey: string | null = null;
  private resolvedUrl: SafeUrl | string = '';
  private loading = false;

  transform(key: string | null | undefined): SafeUrl | string {
    if (!key) {
      this.currentKey = null;
      this.resolvedUrl = '';
      return '';
    }

    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return this.sanitizer.bypassSecurityTrustUrl(cached.url);
    }

    if (this.currentKey === key) {
      return this.resolvedUrl;
    }

    this.currentKey = key;
    this.loading = true;
    this.resolvedUrl = '';

    this.provider.getSignedUrl(key).subscribe({
      next: (url) => {
        cache.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS });
        this.resolvedUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    return this.resolvedUrl;
  }

  ngOnDestroy(): void {
    this.currentKey = null;
  }
}
