import {
  Component,
  input,
  output,
  inject,
  signal,
  computed,
  effect,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type {
  InternshipFormValue,
  CoordinatorUser,
  PwoItem,
  CapabilityInstanceItem,
  SkillItem,
  TaskItem,
  InternshipPlanItem,
} from '../../../../models/manage-internship.models';
import { ManageInternshipApiService } from '../../../../services/manage-internship-api.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'whizard-during-internship-tab',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './during-internship-tab.component.html',
})
export class DuringInternshipTabComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ManageInternshipApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly formValue = input.required<InternshipFormValue>();
  readonly coordinators = input<CoordinatorUser[]>([]);
  readonly functionalGroupId = input<string | null>(null);
  readonly roleId = input<string | null>(null);
  readonly internshipId = input<string | null>(null);
  readonly formChanged = output<Partial<InternshipFormValue>>();

  // Total weeks derived from durationMonths
  readonly totalWeeks = computed(
    () => (this.formValue().durationMonths ?? 0) * 4,
  );

  // PWO options per plan row index
  readonly pwos = signal<PwoItem[]>([]);

  // CI options per plan row: Map<rowIndex, CapabilityInstanceItem[]>
  readonly ciOptionsMap = signal<Map<number, CapabilityInstanceItem[]>>(
    new Map(),
  );

  // Skills per plan (for schedule accordion)
  readonly skillsMap = signal<Map<number, SkillItem[]>>(new Map());

  // Tasks per plan (for schedule accordion)
  readonly tasksMap = signal<Map<number, TaskItem[]>>(new Map());

  // Track whether schedule has been created (locked)
  readonly isScheduleCreated = signal(false);

  // Saved plans from server (for edit mode)
  readonly savedPlans = signal<InternshipPlanItem[]>([]);

  // Selected skills per plan for schedule filtering
  readonly selectedSkillsMap = signal<Map<number, string[]>>(new Map());

  // Schedule selections keyed by "planIndex-localWeek"
  // Each week independently tracks which tasks are selected + evidence
  readonly weekScheduleMap = signal<
    Map<string, Map<string, { selected: boolean; evidence: string; orderIndex: number }>>
  >(new Map());

  // Plan form array
  planForm!: FormGroup;

  get planArray(): FormArray {
    return this.planForm.get('plans') as FormArray;
  }

  constructor() {
    this.planForm = this.fb.group({
      plans: this.fb.array([]),
    });

    // Load PWOs when functionalGroupId or roleId changes
    effect(() => {
      const fgId = this.functionalGroupId();
      const rId = this.roleId();
      if (fgId) {
        this.api.listPwos(fgId, rId ?? undefined).subscribe((pwos) => {
          this.pwos.set(pwos);
          // Auto-select first PWO for each existing plan row that has no PWO selected
          if (pwos.length > 0) {
            for (let i = 0; i < this.planArray.length; i++) {
              const row = this.planArray.at(i) as FormGroup;
              if (!row.value.pwoId) {
                row.patchValue({ pwoId: pwos[0].id });
                this.onPwoChange(i, pwos[0].id);
              }
            }
          }
        });
      } else {
        this.pwos.set([]);
      }
    });

    // Auto-select first mentor when coordinators change
    effect(() => {
      const coords = this.coordinators();
      if (coords.length > 0) {
        for (let i = 0; i < this.planArray.length; i++) {
          const row = this.planArray.at(i) as FormGroup;
          if (!row.value.mentorUserId) {
            row.patchValue({ mentorUserId: coords[0].id });
          }
        }
      }
    });
  }

  ngOnInit(): void {
    // Load existing plans if editing
    const intId = this.internshipId();
    if (intId) {
      this.api.getPlans(intId).subscribe((plans) => {
        if (plans.length > 0) {
          this.savedPlans.set(plans);
          this.restorePlansFromServer(plans);
        } else {
          this.addPlanRow();
        }
      });
    } else {
      this.addPlanRow();
    }
  }

  private restorePlansFromServer(plans: InternshipPlanItem[]): void {
    this.planArray.clear();
    const ciMap = new Map<number, CapabilityInstanceItem[]>();
    const skillsMap = new Map<number, SkillItem[]>();
    const tasksMap = new Map<number, TaskItem[]>();
    const selectedSkillsMap = new Map<number, string[]>();
    const weekMap = new Map<
      string,
      Map<string, { selected: boolean; evidence: string; orderIndex: number }>
    >();

    plans.forEach((plan, i) => {
      this.planArray.push(
        this.fb.group({
          pwoId: [plan.pwoId, Validators.required],
          mentorUserId: [plan.mentorUserId, Validators.required],
          capabilityInstanceId: [
            plan.capabilityInstanceId,
            Validators.required,
          ],
          noOfWeeks: [plan.noOfWeeks, [Validators.required, Validators.min(1)]],
        }),
      );

      ciMap.set(i, [
        { id: plan.capabilityInstanceId, name: plan.capabilityInstanceName },
      ]);

      if (plan.schedules.length > 0) {
        const skillIds = [...new Set(plan.schedules.map((s) => s.skillId))];
        const skillItems = skillIds.map((sid) => {
          const sched = plan.schedules.find((s) => s.skillId === sid);
          return { id: sid, name: sched?.skillName ?? '' };
        });
        skillsMap.set(i, skillItems);
        selectedSkillsMap.set(i, skillIds);

        // Deduplicate tasks by id for the task list
        const seenTaskIds = new Set<string>();
        const taskItems: TaskItem[] = [];
        plan.schedules.forEach((s) => {
          if (!seenTaskIds.has(s.taskId)) {
            seenTaskIds.add(s.taskId);
            taskItems.push({
              id: s.taskId,
              name: s.taskName,
              description: null,
              skillId: s.skillId,
              evidence: s.evidence,
            });
          }
        });
        tasksMap.set(i, taskItems);

        // Populate per-week task selections
        plan.schedules.forEach((s) => {
          const key = this.weekKey(i, s.weekNumber);
          if (!weekMap.has(key)) {
            weekMap.set(key, new Map());
          }
          weekMap.get(key)!.set(s.taskId, {
            selected: true,
            evidence: s.evidence,
            orderIndex: s.orderIndex,
          });
        });
      }
    });

    this.ciOptionsMap.set(ciMap);
    this.skillsMap.set(skillsMap);
    this.tasksMap.set(tasksMap);
    this.selectedSkillsMap.set(selectedSkillsMap);
    this.weekScheduleMap.set(weekMap);

    if (plans.some((p) => p.schedules.length > 0)) {
      this.isScheduleCreated.set(true);
    }
  }

  addPlanRow(): void {
    const firstPwo = this.pwos().length > 0 ? this.pwos()[0].id : '';
    const firstMentor =
      this.coordinators().length > 0 ? this.coordinators()[0].id : '';

    this.planArray.push(
      this.fb.group({
        pwoId: [firstPwo, Validators.required],
        mentorUserId: [firstMentor, Validators.required],
        capabilityInstanceId: ['', Validators.required],
        noOfWeeks: [1, [Validators.required, Validators.min(1)]],
      }),
    );

    // Auto-load CIs for the first PWO
    const newIndex = this.planArray.length - 1;
    if (firstPwo) {
      this.onPwoChange(newIndex, firstPwo);
    }
  }

  removePlanRow(index: number): void {
    this.planArray.removeAt(index);
    // Clean up maps
    this.ciOptionsMap.update((m) => {
      m.delete(index);
      return new Map(m);
    });
  }

  onPwoChange(index: number, pwoId: string): void {
    if (!pwoId) return;

    // Reset CI for this row
    const row = this.planArray.at(index) as FormGroup;
    row.patchValue({ capabilityInstanceId: '' });

    this.api.listCapabilityInstances(pwoId).subscribe((cis) => {
      this.ciOptionsMap.update((m) => {
        const newMap = new Map(m);
        newMap.set(index, cis);
        return newMap;
      });
      // Auto-select first CI
      if (cis.length > 0) {
        row.patchValue({ capabilityInstanceId: cis[0].id });
      }
    });
  }

  getCiOptions(index: number): CapabilityInstanceItem[] {
    return this.ciOptionsMap().get(index) ?? [];
  }

  getWeekSum(): number {
    let sum = 0;
    for (let i = 0; i < this.planArray.length; i++) {
      sum += +(this.planArray.at(i) as FormGroup).value.noOfWeeks || 0;
    }
    return sum;
  }

  onCreateSchedule(): void {
    const weekSum = this.getWeekSum();
    const total = this.totalWeeks();

    if (weekSum !== total) {
      this.snackBar.open(
        `Total weeks in plan (${weekSum}) must equal internship duration (${total} weeks).`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['whizard-snackbar'],
        },
      );
      return;
    }

    if (!this.planForm.valid) {
      this.snackBar.open(
        'Please fill all required fields in the internship plan.',
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['whizard-snackbar'],
        },
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Create Internship Schedule',
        message:
          'Are you sure you want to create the schedule? The plan will be locked for editing.',
      },
      panelClass: 'whizard-dialog-dark',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isScheduleCreated.set(true);
        this.loadScheduleData();
        this.savePlansToServer();
      }
    });
  }

  onEditPlan(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Edit Internship Plan',
        message: 'Editing the plan will reset all schedule data. Are you sure?',
      },
      panelClass: 'whizard-dialog-dark',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isScheduleCreated.set(false);
        this.skillsMap.set(new Map());
        this.tasksMap.set(new Map());
        this.selectedSkillsMap.set(new Map());
        this.weekScheduleMap.set(new Map());
      }
    });
  }

  private loadScheduleData(): void {
    for (let i = 0; i < this.planArray.length; i++) {
      const row = this.planArray.at(i) as FormGroup;
      const ciId = row.value.capabilityInstanceId;
      if (ciId) {
        this.api.listSkills(ciId).subscribe((skills) => {
          this.skillsMap.update((m) => {
            const newMap = new Map(m);
            newMap.set(i, skills);
            return newMap;
          });
        });
      }
    }
  }

  getSkills(planIndex: number): SkillItem[] {
    return this.skillsMap().get(planIndex) ?? [];
  }

  getSelectedSkills(planIndex: number): string[] {
    return this.selectedSkillsMap().get(planIndex) ?? [];
  }

  onSkillsChange(planIndex: number, skillIds: string[]): void {
    this.selectedSkillsMap.update((m) => {
      const newMap = new Map(m);
      newMap.set(planIndex, skillIds);
      return newMap;
    });

    if (skillIds.length > 0) {
      this.api.listTasks(skillIds).subscribe((tasks) => {
        this.tasksMap.update((m) => {
          const newMap = new Map(m);
          newMap.set(planIndex, tasks);
          return newMap;
        });
      });
    } else {
      this.tasksMap.update((m) => {
        const newMap = new Map(m);
        newMap.set(planIndex, []);
        return newMap;
      });
    }
  }

  getTasks(planIndex: number): TaskItem[] {
    return this.tasksMap().get(planIndex) ?? [];
  }

  // --- Week-based schedule helpers ---

  private weekKey(planIndex: number, localWeek: number): string {
    return `${planIndex}-${localWeek}`;
  }

  /** Flattened list of all weeks across all plans */
  getAllWeeks(): Array<{
    globalWeek: number;
    planIndex: number;
    localWeek: number;
  }> {
    const weeks: Array<{
      globalWeek: number;
      planIndex: number;
      localWeek: number;
    }> = [];
    let globalWeek = 1;
    for (let i = 0; i < this.planArray.length; i++) {
      const noOfWeeks = this.getPlanRowValue(i).noOfWeeks;
      for (let w = 1; w <= noOfWeeks; w++) {
        weeks.push({ globalWeek: globalWeek++, planIndex: i, localWeek: w });
      }
    }
    return weeks;
  }

  isTaskSelectedInWeek(
    planIndex: number,
    localWeek: number,
    taskId: string,
  ): boolean {
    return (
      this.weekScheduleMap()
        .get(this.weekKey(planIndex, localWeek))
        ?.get(taskId)?.selected ?? false
    );
  }

  getTaskEvidenceInWeek(
    planIndex: number,
    localWeek: number,
    taskId: string,
  ): string {
    return (
      this.weekScheduleMap()
        .get(this.weekKey(planIndex, localWeek))
        ?.get(taskId)?.evidence ?? ''
    );
  }

  onTaskToggleInWeek(
    planIndex: number,
    localWeek: number,
    taskId: string,
    checked: boolean,
    defaultEvidence: string,
  ): void {
    const key = this.weekKey(planIndex, localWeek);
    this.weekScheduleMap.update((m) => {
      const newMap = new Map(m);
      const weekSelections = new Map(newMap.get(key) ?? new Map());
      const existing = weekSelections.get(taskId);
      weekSelections.set(taskId, {
        selected: checked,
        evidence: existing?.evidence ?? defaultEvidence,
        orderIndex: existing?.orderIndex ?? (checked ? weekSelections.size : 0),
      });
      newMap.set(key, weekSelections);
      return newMap;
    });
    this.autoSaveSchedules();
  }

  onEvidenceChangeInWeek(
    planIndex: number,
    localWeek: number,
    taskId: string,
    evidence: string,
  ): void {
    const key = this.weekKey(planIndex, localWeek);
    this.weekScheduleMap.update((m) => {
      const newMap = new Map(m);
      const weekSelections = new Map(newMap.get(key) ?? new Map());
      const existing = weekSelections.get(taskId);
      weekSelections.set(taskId, {
        selected: existing?.selected ?? false,
        evidence,
        orderIndex: existing?.orderIndex ?? 0,
      });
      newMap.set(key, weekSelections);
      return newMap;
    });
    this.autoSaveSchedules();
  }

  getPlanRowValue(index: number): {
    pwoId: string;
    mentorUserId: string;
    capabilityInstanceId: string;
    noOfWeeks: number;
  } {
    return (this.planArray.at(index) as FormGroup).value;
  }

  getPwoName(pwoId: string): string {
    return this.pwos().find((p) => p.id === pwoId)?.name ?? '';
  }

  getMentorName(mentorUserId: string): string {
    return (
      this.coordinators().find((c) => c.id === mentorUserId)?.name ??
      mentorUserId
    );
  }

  getCiName(planIndex: number, ciId: string): string {
    return (
      this.getCiOptions(planIndex).find((c) => c.id === ciId)?.name ?? ciId
    );
  }

  private savePlansToServer(): void {
    const intId = this.internshipId();
    if (!intId) return;

    const plans = [];
    for (let i = 0; i < this.planArray.length; i++) {
      const row = this.getPlanRowValue(i);
      const schedules: Array<{
        taskId: string;
        weekNumber: number;
        orderIndex: number;
        evidence: string;
      }> = [];

      // Collect selected tasks from each local week of this plan
      for (let w = 1; w <= row.noOfWeeks; w++) {
        const weekSelections = this.weekScheduleMap().get(this.weekKey(i, w));
        if (weekSelections) {
          for (const [taskId, entry] of weekSelections) {
            if (entry.selected) {
              schedules.push({
                taskId,
                weekNumber: w,
                orderIndex: entry.orderIndex,
                evidence: entry.evidence,
              });
            }
          }
        }
      }

      plans.push({ ...row, schedules });
    }

    this.api.savePlans(intId, plans).subscribe();
  }

  private autoSaveSchedules(): void {
    // Debounced auto-save whenever schedule changes
    const intId = this.internshipId();
    if (!intId || !this.isScheduleCreated()) return;
    this.savePlansToServer();
  }

  // Mid-Term Feedback (out of scope of plans but kept here as per existing behavior)
  protected getMidTermDate(): Date | null {
    const d = this.formValue().midTermFeedbackDate;
    return d ? new Date(d) : null;
  }

  protected onMidTermDateChange(date: Date | null): void {
    this.formChanged.emit({
      midTermFeedbackDate: date ? date.toISOString() : null,
    });
  }
}
