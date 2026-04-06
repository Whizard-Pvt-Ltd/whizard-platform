import { Component, input, output } from '@angular/core';
import { MatTabsModule, MatTabContent } from '@angular/material/tabs';
import { ScrollbarDirective } from '@whizard/shared-ui';
import type { InternshipFormValue, City, IndustryRole } from '../../models/manage-internship.models';
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
    ScrollbarDirective,
  ],
  styles: `
    :host ::ng-deep .mat-mdc-tab-body.mat-mdc-tab-body-active {
      position: relative;
      overflow-x: hidden;
      overflow-y: hidden; /* ✅ kill the tab-body scroll */
      z-index: 1;
      flex-grow: 1;
    }

    /* Also target the inner wrapper Angular adds */
    :host ::ng-deep .mat-mdc-tab-body-content {
      overflow: hidden; /* ✅ this is the actual scrollable div, disable it */
      height: 100%;
    }
  `,
  templateUrl: './internship-form.component.html',
})
export class InternshipFormComponent {
  readonly formValue = input.required<InternshipFormValue>();
  readonly cities = input<City[]>([]);
  readonly industryRoles = input<IndustryRole[]>([]);
  readonly formChanged = output<Partial<InternshipFormValue>>();
}
