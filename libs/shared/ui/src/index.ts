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

// Toaster
export { ToasterService } from './toaster/toaster.service.js';
export { ToastComponent } from './toaster/toast.component.js';
export { ToasterContainerComponent } from './toaster/toaster-container.component.js';
export type { Toast, ToastVariant, ToastOptions } from './toaster/toaster.types.js';

// Confirmation dialog
export { ConfirmationService } from './confirmation/confirmation.service.js';
export { ConfirmationDialogComponent } from './confirmation/dialog/confirmation-dialog.component.js';
export type {
  WhizardConfirmationConfig,
  ConfirmationIconColor,
  ConfirmationActionColor,
  ConfirmationDialogResult,
} from './confirmation/confirmation.types.js';

// Loading bar
export { LoadingService } from './loading/loading.service.js';
export type { LoadingMode } from './loading/loading.service.js';
export { loadingInterceptor } from './loading/loading.interceptor.js';
export { LoadingBarComponent } from './loading/loading-bar.component.js';

// Signed URL pipe
export { SignedUrlPipe } from './signed-url/signed-url.pipe.js';
export { SIGNED_URL_PROVIDER } from './signed-url/signed-url.token.js';
export type { SignedUrlProvider } from './signed-url/signed-url.token.js';

// Layout
export { AdminLayoutComponent } from './layout/layout.component.js';
export { AdminFooterComponent } from './layout/footer.component.js';
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
