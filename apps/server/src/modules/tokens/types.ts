export type AccessTokenPayload = {
  subject: string;
  role: string;
};

export type RefreshTokenParams = {
  userId: string;
  newRefreshToken: string;
};