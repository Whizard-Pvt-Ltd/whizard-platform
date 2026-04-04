import { Component, inject, signal, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ScrollbarDirective } from '@whizard/shared-ui';
import { StackAuthService } from '../../core/services/stack-auth.service';

@Component({
  selector: 'whizard-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, ScrollbarDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly stackAuthService = inject(StackAuthService);

  protected drawerOpen = signal(false);
  protected userMenuOpen = signal(false);

  protected get userName(): string | null {
    const user = this.stackAuthService.currentUser();
    return user?.displayName ?? user?.email?.split('@')[0] ?? null;
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.stackAuthService.signOut();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    if (this.userMenuOpen() && !target.closest('.avatar-wrapper')) {
      this.userMenuOpen.set(false);
    }
  }
}
