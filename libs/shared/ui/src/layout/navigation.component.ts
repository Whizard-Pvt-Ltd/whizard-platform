import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import {
  isActive,
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, take } from 'rxjs';
import { NavigationItem } from './navigation.types';

@Component({
  selector: 'whizard-navigation',
  imports: [
    MatIcon,
    NgTemplateOutlet,
    RouterLinkActive,
    Tree,
    TreeItem,
    TreeItemGroup,
    RouterLink,
    CdkMonitorFocus,
  ],
  template: `
    <div class="flex flex-col gap-y-2">
      @for (section of navigation(); track section.id) {
        <div class="flex flex-col px-3">
          <div
            class="px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase"
            style="color: #7F94AE"
          >
            {{ section.label }}
          </div>

          <ul
            ngTree
            class="flex flex-col gap-y-0.5"
            [nav]="true"
            #tree="ngTree"
          >
            <ng-template
              [ngTemplateOutlet]="treeNodes"
              [ngTemplateOutletContext]="{
                nodes: section.children,
                parent: tree,
              }"
            />
          </ul>

          <ng-template let-nodes="nodes" let-parent="parent" #treeNodes>
            @for (node of nodes; track node.id) {
              <a
                cdkMonitorElementFocus
                ngTreeItem
                routerLinkActive="nav-item-active"
                class="nav-item flex cursor-pointer items-center gap-x-3 h-12 rounded-lg px-3 select-none transition-[background,border-color] duration-120"
                style="border-left: 3px solid transparent; color: #E8F0FA; font-size: 15px;"
                [parent]="parent"
                [value]="node.id"
                [label]="node.label"
                [disabled]="node.disabled"
                [selectable]="!node.children"
                [(expanded)]="node.expanded"
                [routerLink]="node.route"
                [routerLinkActiveOptions]="
                  node.activeOptions ?? { exact: true }
                "
                (click)="$event.preventDefault()"
                #treeItem="ngTreeItem"
              >
                @if (node.icon) {
                  <mat-icon
                    class="size-4.5 shrink-0 opacity-80"
                    [svgIcon]="node.icon"
                  />
                }

                <div class="flex-auto font-normal">{{ node.label }}</div>

                @if (node.badge) {
                  <div
                    class="rounded px-1.5 py-0.5 text-xs font-medium tabular-nums"
                    style="background: #314DDF; color: #E8F0FA"
                  >
                    {{ node.badge }}
                  </div>
                }

                @if (node.children && node.children.length > 0) {
                  <mat-icon
                    svgIcon="heroicons_outline:chevron-right"
                    class="size-4 pointer-events-none transition-[rotate]"
                    [class.rotate-90]="node.expanded"
                  />
                }
              </a>

              @if (node.children && node.children.length > 0) {
                <ul
                  class="flex flex-col gap-y-0.5 [&>.nav-item]:pl-10"
                  [class.hidden]="!node.expanded"
                  [class.mt-0.5]="node.expanded"
                  role="group"
                >
                  <ng-template
                    ngTreeItemGroup
                    [ownedBy]="treeItem"
                    #group="ngTreeItemGroup"
                  >
                    <ng-template
                      [ngTemplateOutlet]="treeNodes"
                      [ngTemplateOutletContext]="{
                        nodes: node.children,
                        parent: group,
                      }"
                    />
                  </ng-template>
                </ul>
              }
            }
          </ng-template>
        </div>
      }
    </div>

    <style>
      .nav-item:hover {
        background: #1e293b;
      }
      .nav-item-active {
        background: #2d2a5a !important;
        border-left-color: #00bfff !important;
      }
    </style>
  `,
})
export class NavigationComponent {
  items = input.required<NavigationItem[]>();

  private router = inject(Router);

  protected navigation = signal<NavigationItem[]>([]);
  private navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      take(1),
    ),
  );

  constructor() {
    effect(() => {
      this.navigation.set(this.items());
    });

    effect(() => {
      const navigationEnd = this.navigationEnd();
      if (!navigationEnd) return;
      this.navigation.set(this.expandActiveRoute(this.navigation()));
    });
  }

  private expandActiveRoute(items: NavigationItem[]): NavigationItem[] {
    for (const item of items) {
      if (item.children?.length) {
        item.children = this.expandActiveRoute(item.children);
        if (item.children.some((child) => child.expanded)) {
          item.expanded = true;
        }
      }
      if (
        item.route &&
        isActive(
          item.route,
          this.router,
          this.isActiveOption(item.activeOptions ?? { exact: true }),
        )()
      ) {
        item.expanded = true;
      }
    }
    return items;
  }

  private isActiveOption(
    options: { exact: boolean } | IsActiveMatchOptions,
  ): IsActiveMatchOptions {
    if ('exact' in options) {
      return options.exact
        ? {
            paths: 'exact',
            queryParams: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored',
          }
        : {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
          };
    }
    return options;
  }
}
