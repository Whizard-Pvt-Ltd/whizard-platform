/**
 * Whizard Shared UI Library
 *
 * Reusable UI components for all Whizard web portals
 */

// Scrollbar directive
export { ScrollbarDirective } from './directives/scrollbar/scrollbar.directive.js';
export { ScrollbarGeometry, ScrollbarPosition } from './directives/scrollbar/scrollbar.types.js';

// Authentication Components
export * from './auth/index.js';

// Quill rich text editor
export { QuillEditorComponent } from './quill-editor/quill-editor.component.js';

// PDF viewer
export { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component.js';
export type { PdfViewerDialogData } from './pdf-viewer/pdf-viewer.component.js';

// Video player overlay
export { VideoPlayerComponent } from './video-player/video-player.component.js';

// Image lightbox overlay
export { ImageLightboxComponent } from './image-lightbox/image-lightbox.component.js';
export type { ImageLightboxDialogData } from './image-lightbox/image-lightbox.component.js';

// Media uploader
export { MediaUploaderComponent } from './media-uploader/media-uploader.component.js';
export type { UploadedFile } from './media-uploader/media-uploader.component.js';

// Signed URL pipe
export { SignedUrlPipe } from './signed-url/signed-url.pipe.js';
export { SIGNED_URL_PROVIDER } from './signed-url/signed-url.token.js';
export type { SignedUrlProvider } from './signed-url/signed-url.token.js';

// Layout
export { AdminLayoutComponent } from './layout/layout.component.js';
export { PageActionsService } from './layout/page-actions.service.js';
export type { PageAction } from './layout/page-actions.service.js';
export { AdminSidebarComponent } from './layout/sidebar.component.js';
export { NavigationComponent } from './layout/navigation.component.js';
export { SchemeSwitcherComponent } from './layout/scheme-switcher.component.js';
export { NotificationsComponent } from './layout/notifications.component.js';
export { UserMenuComponent } from './layout/user-menu.component.js';
export type { NavigationItem } from './layout/navigation.types.js';
export { NAVIGATION_ITEMS } from './layout/navigation.types.js';
export type { LayoutUser, LayoutAuthService, LayoutTenantService, TenantOption } from './layout/auth.token.js';
export { LAYOUT_AUTH_SERVICE, LAYOUT_TENANT_SERVICE } from './layout/auth.token.js';
