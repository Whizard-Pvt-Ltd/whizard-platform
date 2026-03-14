import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StackAuthService } from '../../core/services/stack-auth.service';

@Component({
  selector: 'whizard-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);

  protected userName: string | null = null;
  protected userEmail: string | null = null;

  ngOnInit(): void {
    // Get user info from Stack Auth
    const user = this.stackAuthService.currentUser();
    if (user) {
      this.userName = user.displayName;
      this.userEmail = user.email;
    }
  }

  protected logout(): void {
    this.stackAuthService.signOut();
  }
}
