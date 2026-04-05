import { Component } from '@angular/core';

@Component({
  selector: 'whizard-dashboard',
  standalone: true,
  imports: [],
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-y-auto' },
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {}
