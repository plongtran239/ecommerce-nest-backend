export interface CreateAccessTokenPayload {
  userId: number;
  deviceId: number;
  roleId: number;
  roleName: string;
}

export interface AccessTokenPayload extends CreateAccessTokenPayload {
  exp: number;
  iat: number;
}

export interface CreateRefreshTokenPayload {
  userId: number;
}

export interface RefreshTokenPayload extends CreateRefreshTokenPayload {
  exp: number;
  iat: number;
}
