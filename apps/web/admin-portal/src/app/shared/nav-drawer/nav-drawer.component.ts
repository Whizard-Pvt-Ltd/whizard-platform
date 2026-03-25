import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'whizard-nav-drawer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.css'
})
export class NavDrawerComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
}
