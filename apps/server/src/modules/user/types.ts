export type UserContactOptions = {
  email?: string;
  phone?: string;
};

export type UserIdentifierOptions = {
  username: string;
  email?: string;
  phone?: string;
}

export type UserOptions = {
  id: string;
  email: string | null;
  phone: string | null;
  username: string;
  display_name: string | null;
  role: 'user' | 'admin';
  deleted_at: Date | null;
};