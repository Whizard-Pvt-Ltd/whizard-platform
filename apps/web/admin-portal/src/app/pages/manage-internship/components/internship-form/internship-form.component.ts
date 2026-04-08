import { Component, input, output } from '@angular/core';
import { MatTabsModule, MatTabContent } from '@angular/material/tabs';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { InternshipFormValue, City, IndustryRole, CoordinatorUser, FunctionalGroup } from '../../models/manage-internship.models';
import { DetailsTabComponent } from './tabs/details-tab/details-tab.component';
import { DuringInternshipTabComponent } from './tabs/during-internship-tab/during-internship-tab.component';
import { FinalSubmissionTabComponent } from './tabs/final-submission-tab/final-submission-tab.component';
import { ScreeningCriteriaTabComponent } from './tabs/screening-criteria-tab/screening-criteria-tab.component';
import { SelectionTabComponent } from './tabs/selection-tab/selection-tab.component';

@Component({
  selector: 'whizard-internship-form',
  standalone: true,
  imports: [
    MatTabsModule,
    MatTabContent,
    DetailsTabComponent,
    ScreeningCriteriaTabComponent,
    SelectionTabComponent,
    DuringInternshipTabComponent,
    FinalSubmissionTabComponent,
    ScrollbarDirective
  ],
  styles: `
    :host ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
    }

    :host ::ng-deep .mat-mdc-tab-body.mat-mdc-tab-body-active {
      position: relative;
      overflow: visible;
      z-index: 1;
    }

    :host ::ng-deep .mat-mdc-tab-body-content {
      overflow: visible;
    }

    :host ::ng-deep .mat-mdc-tab-header {
      border-bottom: 1px solid var(--color-whizard-border);
      position: sticky;
      top: 0;
      z-index: 5;
      background: var(--color-whizard-bg-main);
    }

    :host ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
      color: var(--color-whizard-text-gray);
      font-family: var(--font-whizard-display);
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.15px;
    }

    :host ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: var(--color-whizard-text-primary);
    }

    :host ::ng-deep .mat-mdc-tab-header .mdc-tab-indicator__content--underline {
      border-color: var(--color-whizard-action);
      border-top-width: 4px;
      border-radius: 4px;
    }
  `,
  templateUrl: './internship-form.component.html',
})
export class InternshipFormComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly cities = input<City[]>([]);
  readonly industryRoles = input<IndustryRole[]>([]);
  readonly coordinators = input<CoordinatorUser[]>([]);
  readonly functionalGroups = input<FunctionalGroup[]>([]);
  readonly formChanged = output<Partial<InternshipFormValue>>();
}
