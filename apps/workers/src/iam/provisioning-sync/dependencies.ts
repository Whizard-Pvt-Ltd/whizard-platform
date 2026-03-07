import type { DeprovisionAccessCommand } from '@whizard/identity-access';

export interface DeactivationFeedRecord {
  readonly externalUserId: string;
  readonly tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  readonly tenantId: string;
  readonly reason: string;
  readonly occurredAt: string;
}

export interface DeactivationFeedClient {
  fetchSince(checkpoint: string | null): Promise<readonly DeactivationFeedRecord[]>;
}

export interface ProvisioningCommandExecutor {
  deprovision(command: DeprovisionAccessCommand): Promise<void>;
}

export interface SyncCheckpointStore {
  get(): Promise<string | null>;
  save(checkpoint: string): Promise<void>;
}

class NoopDeactivationFeedClient implements DeactivationFeedClient {
  async fetchSince(): Promise<readonly DeactivationFeedRecord[]> {
    return [];
  }
}

class NotImplementedProvisioningExecutor implements ProvisioningCommandExecutor {
  async deprovision(): Promise<void> {
    throw new Error('Provisioning command executor is not wired to DeprovisionAccessHandler.');
  }
}

class InMemoryCheckpointStore implements SyncCheckpointStore {
  private checkpoint: string | null = null;

  async get(): Promise<string | null> {
    return this.checkpoint;
  }

  async save(checkpoint: string): Promise<void> {
    this.checkpoint = checkpoint;
  }
}

export interface ProvisioningSyncDependencies {
  readonly feedClient: DeactivationFeedClient;
  readonly executor: ProvisioningCommandExecutor;
  readonly checkpointStore: SyncCheckpointStore;
}

export const createProvisioningSyncDependencies = (): ProvisioningSyncDependencies => {
  return {
    feedClient: new NoopDeactivationFeedClient(),
    executor: new NotImplementedProvisioningExecutor(),
    checkpointStore: new InMemoryCheckpointStore()
  };
};
