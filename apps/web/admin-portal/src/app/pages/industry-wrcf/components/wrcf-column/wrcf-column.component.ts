import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { WrcfEntity } from '../../models/wrcf.models';

@Component({
  selector: 'whizard-wrcf-column',
  standalone: true,
  templateUrl: './wrcf-column.component.html',
  styleUrl: './wrcf-column.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrcfColumnComponent {
  @Input() title = '';
  @Input() items: WrcfEntity[] = [];
  @Input() selectedId: string | null = null;
  @Input() showAdd = true;
  @Input() readonly = false;
  @Output() itemSelected = new EventEmitter<WrcfEntity>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<WrcfEntity>();
}
