export type RegisterUserParams = {
  handle: string;
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
  role: 'user' | 'admin';
  deleted_at: Date | null;
};