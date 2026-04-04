import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ScrollbarDirective } from '@whizard/shared-ui';
import { WrcfEntity } from '../../models/wrcf.models';

@Component({
  selector: 'whizard-wrcf-column',
  standalone: true,
  templateUrl: './wrcf-column.component.html',
  styleUrl: './wrcf-column.component.css',
  imports: [ScrollbarDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrcfColumnComponent {
  @Input() title = '';
  @Input() items: WrcfEntity[] = [];
  @Input() selectedId: string | null = null;
  @Input() showAdd = true;
  @Input() showEdit = true;
  @Input() readonly = false;
  @Input() checkboxMode = false;
  @Input() checkedIds: string[] = [];
  @Input() savedIds: string[] = [];
  @Output() itemSelected = new EventEmitter<WrcfEntity>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<WrcfEntity>();
  @Output() checkboxToggled = new EventEmitter<WrcfEntity>();
}
