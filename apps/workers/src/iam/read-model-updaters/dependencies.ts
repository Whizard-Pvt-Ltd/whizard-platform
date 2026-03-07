import type { IamIntegrationEventV1 } from '@whizard/identity-access';

export interface ReadModelEventSubscription {
  pull(batchSize: number): Promise<readonly IamIntegrationEventV1[]>;
  acknowledge(eventId: string): Promise<void>;
}

export interface AdminReadModelProjector {
  project(event: IamIntegrationEventV1): Promise<void>;
}

export interface AuditReadModelProjector {
  project(event: IamIntegrationEventV1): Promise<void>;
}

class NoopReadModelEventSubscription implements ReadModelEventSubscription {
  async pull(): Promise<readonly IamIntegrationEventV1[]> {
    return [];
  }

  async acknowledge(): Promise<void> {
    return;
  }
}

class NoopAdminReadModelProjector implements AdminReadModelProjector {
  async project(): Promise<void> {
    return;
  }
}

class NoopAuditReadModelProjector implements AuditReadModelProjector {
  async project(): Promise<void> {
    return;
  }
}

export interface ReadModelUpdaterDependencies {
  readonly subscription: ReadModelEventSubscription;
  readonly adminProjector: AdminReadModelProjector;
  readonly auditProjector: AuditReadModelProjector;
}

export const createReadModelUpdaterDependencies = (): ReadModelUpdaterDependencies => {
  return {
    subscription: new NoopReadModelEventSubscription(),
    adminProjector: new NoopAdminReadModelProjector(),
    auditProjector: new NoopAuditReadModelProjector()
  };
};
