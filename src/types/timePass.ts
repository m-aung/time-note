export interface TimePass {
  id: string;
  label: string;
  expireAt: string;
  personaId: string;
  status: 'active' | 'expired' | 'paused';
  createdAt: string;
  updatedAt: string;
} 