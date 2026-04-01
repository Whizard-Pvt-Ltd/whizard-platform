export enum ContactRole {
  ViceChancellor = 'VICE_CHANCELLOR',
  PlacementHead = 'PLACEMENT_HEAD',
  Coordinator = 'COORDINATOR',
  PlacementCoordinator = 'PLACEMENT_COORDINATOR',
  GroomCoordinator = 'GROOM_COORDINATOR',
}

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  [ContactRole.ViceChancellor]:     'Vice Chancellor',
  [ContactRole.PlacementHead]:      'Placement Head',
  [ContactRole.Coordinator]:        'Coordinator',
  [ContactRole.PlacementCoordinator]: 'Placement Coordinator',
  [ContactRole.GroomCoordinator]:   'Groom Coordinator',
};
