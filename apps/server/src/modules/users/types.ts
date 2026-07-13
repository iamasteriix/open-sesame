export type UserRoles = 'admin' | 'user';

export type RegisterUserParams = {
  username: string;
  email: string;
  role: string;
  credentialType: string;
  credentialData: Record<string, unknown>,
}

export type UserOptions = {
  id: string;
  email: string;
  phone: string | null;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: UserRoles[];
};