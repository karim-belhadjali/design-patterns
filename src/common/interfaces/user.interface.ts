export type UserRole = 'owner' | 'member' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  homeId: string;
}
