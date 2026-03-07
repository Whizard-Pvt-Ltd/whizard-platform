export type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

export type AuthenticationMode = 'LOCAL_PASSWORD' | 'FEDERATED';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEPROVISIONED';

export type AccessPrincipalStatus = 'ACTIVE' | 'SUSPENDED';

export type SessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type ProvisioningLifecycleStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEPROVISIONED';

export type MfaFactorType = 'TOTP' | 'SMS' | 'EMAIL' | 'WEBAUTHN';

export type ProtocolType = 'OIDC' | 'SAML2' | 'OAUTH2';

export type DecisionEffect = 'ALLOW' | 'DENY';
