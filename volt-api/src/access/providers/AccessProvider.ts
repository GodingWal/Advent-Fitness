export interface UnlockDoorInput {
  providerDoorId: string;
  userId: string;
}

export interface UnlockDoorResult {
  success: boolean;
  providerEventId?: string | null;
}

export interface AccessProvider {
  unlockDoor(input: UnlockDoorInput): Promise<UnlockDoorResult>;
  getDoorStatus(providerDoorId: string): Promise<'ONLINE' | 'OFFLINE' | 'UNKNOWN'>;
  provisionMember?(input: { providerDoorId: string; userId: string }): Promise<void>;
  revokeMember?(input: { providerDoorId: string; userId: string }): Promise<void>;
}
