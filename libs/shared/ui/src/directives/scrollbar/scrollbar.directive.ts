import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { ScrollbarGeometry, ScrollbarPosition } from './scrollbar.types';

@Directive({
  selector: '[whizardScrollbar]',
  exportAs: 'whizardScrollbar',
  standalone: true,
})
export class ScrollbarDirective implements OnChanges, OnInit, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _platform = inject(Platform);

  @Input() whizardScrollbar: boolean = true;
  @Input() whizardScrollbarOptions: PerfectScrollbar.Options = {};

  private _animation: number | null = null;
  private _options: PerfectScrollbar.Options = {};
  private _ps: PerfectScrollbar | null = null;
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  get elementRef(): ElementRef {
    return this._elementRef;
  }

  get ps(): PerfectScrollbar | null {
    return this._ps;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('whizardScrollbar' in changes) {
      this.whizardScrollbar = coerceBooleanProperty(changes['whizardScrollbar'].currentValue);
      if (this.whizardScrollbar) {
        this._init();
      } else {
        this._destroy();
      }
    }

    if ('whizardScrollbarOptions' in changes) {
      this._options = { ...this._options, ...changes['whizardScrollbarOptions'].currentValue };
      if (!this._ps) return;
      setTimeout(() => this._destroy());
      setTimeout(() => this._init());
    }
  }

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(150))
      .subscribe(() => this.update());
  }

  ngOnDestroy(): void {
    this._destroy();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  isEnabled(): boolean {
    return this.whizardScrollbar;
  }

  update(): void {
    if (!this._ps) return;
    this._ps.update();
  }

  destroy(): void {
    this.ngOnDestroy();
  }

  geometry(prefix: string = 'scroll'): ScrollbarGeometry {
    return new ScrollbarGeometry(
      this._elementRef.nativeElement[prefix + 'Left'],
      this._elementRef.nativeElement[prefix + 'Top'],
      this._elementRef.nativeElement[prefix + 'Width'],
      this._elementRef.nativeElement[prefix + 'Height'],
    );
  }

  position(absolute: boolean = false): ScrollbarPosition {
    if (!absolute && this._ps) {
      return new ScrollbarPosition(this._ps.reach.x ?? 0, this._ps.reach.y ?? 0);
    }
    return new ScrollbarPosition(
      this._elementRef.nativeElement.scrollLeft,
      this._elementRef.nativeElement.scrollTop,
    );
  }

  scrollTo(x: number, y?: number, speed?: number): void {
    if (y == null && speed == null) {
      this.animateScrolling('scrollTop', x, speed);
    } else {
      if (x != null) this.animateScrolling('scrollLeft', x, speed);
      if (y != null) this.animateScrolling('scrollTop', y, speed);
    }
  }

  scrollToX(x: number, speed?: number): void {
    this.animateScrolling('scrollLeft', x, speed);
  }

  scrollToY(y: number, speed?: number): void {
    this.animateScrolling('scrollTop', y, speed);
  }

  scrollToTop(offset: number = 0, speed?: number): void {
    this.animateScrolling('scrollTop', offset, speed);
  }

  scrollToBottom(offset: number = 0, speed?: number): void {
    const top =
      this._elementRef.nativeElement.scrollHeight -
      this._elementRef.nativeElement.clientHeight;
    this.animateScrolling('scrollTop', top - offset, speed);
  }

  scrollToLeft(offset: number = 0, speed?: number): void {
    this.animateScrolling('scrollLeft', offset, speed);
  }

  scrollToRight(offset: number = 0, speed?: number): void {
    const left =
      this._elementRef.nativeElement.scrollWidth -
      this._elementRef.nativeElement.clientWidth;
    this.animateScrolling('scrollLeft', left - offset, speed);
  }

  animateScrolling(target: string, value: number, speed?: number): void {
    if (this._animation) {
      window.cancelAnimationFrame(this._animation);
      this._animation = null;
    }

    if (!speed || typeof window === 'undefined') {
      this._elementRef.nativeElement[target] = value;
    } else if (value !== this._elementRef.nativeElement[target]) {
      let newValue = 0;
      let scrollCount = 0;
      let oldTimestamp = performance.now();
      let oldValue = this._elementRef.nativeElement[target];
      const cosParameter = (oldValue - value) / 2;

      const step = (newTimestamp: number): void => {
        scrollCount += Math.PI / (speed / (newTimestamp - oldTimestamp));
        newValue = Math.round(value + cosParameter + cosParameter * Math.cos(scrollCount));

        if (this._elementRef.nativeElement[target] === oldValue) {
          if (scrollCount >= Math.PI) {
            this.animateScrolling(target, value, 0);
          } else {
            this._elementRef.nativeElement[target] = newValue;
            oldValue = this._elementRef.nativeElement[target];
            oldTimestamp = newTimestamp;
            this._animation = window.requestAnimationFrame(step);
          }
        }
      };

      window.requestAnimationFrame(step);
    }
  }

  private _init(): void {
    if (this._ps) return;
    if (this._platform.ANDROID || this._platform.IOS || !this._platform.isBrowser) {
      this.whizardScrollbar = false;
      return;
    }
    this._ps = new PerfectScrollbar(this._elementRef.nativeElement, { ...this._options });
  }

  private _destroy(): void {
    if (!this._ps) return;
    this._ps.destroy();
    this._ps = null;
  }
}
