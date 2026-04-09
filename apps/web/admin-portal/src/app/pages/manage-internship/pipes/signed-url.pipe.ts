import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ManageInternshipApiService } from '../services/manage-internship-api.service';

interface CacheEntry {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 4 * 60 * 1000; // 4 min (signed URLs last 5 min)

@Pipe({ name: 'signedUrl', standalone: true, pure: false })
export class SignedUrlPipe implements PipeTransform, OnDestroy {
  private readonly api = inject(ManageInternshipApiService);
  private readonly sanitizer = inject(DomSanitizer);

  private currentKey: string | null = null;
  private resolvedUrl: SafeUrl | string = '';
  private loading = false;

  transform(key: string | null | undefined): SafeUrl | string {
    if (!key) return '';

    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return this.sanitizer.bypassSecurityTrustUrl(cached.url);
    }

    if (this.currentKey === key && this.loading) {
      return this.resolvedUrl;
    }

    this.currentKey = key;
    this.loading = true;

    this.api.getSignedUrl(key).subscribe({
      next: (url) => {
        cache.set(key, { url, expiresAt: Date.now() + CACHE_TTL_MS });
        this.resolvedUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    return this.resolvedUrl;
  }

  ngOnDestroy(): void {
    this.currentKey = null;
  }
}
