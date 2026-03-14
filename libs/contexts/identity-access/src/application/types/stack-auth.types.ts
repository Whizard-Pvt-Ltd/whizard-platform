/**
 * Stack Auth Types
 *
 * Domain types for Stack Auth integration in the application layer.
 * These types are shared between services and use cases.
 */

export interface StackAuthUser {
  readonly userId: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly profileImageUrl: string | null;
  readonly emailVerified: boolean;
}
