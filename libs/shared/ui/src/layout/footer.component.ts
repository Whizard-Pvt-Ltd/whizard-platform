import { Component } from '@angular/core';

@Component({
  selector: 'whizard-admin-footer',
  standalone: true,
  template: `
    <footer
      class="shrink-0 flex items-center justify-between px-8"
      style="
        height: 48px;
        background: #0F172A;
        border-top: 1px solid #484E5D;
        font-family: Poppins, sans-serif;
      "
    >
      <span style="font-size: 12px; color: #7F94AE;">
        &copy; {{ year }} Whizard &middot; All rights reserved
      </span>
      <span style="font-size: 12px; color: #484E5D;">v1.0.0</span>
    </footer>
  `,
})
export class AdminFooterComponent {
  protected readonly year = new Date().getFullYear();
}
