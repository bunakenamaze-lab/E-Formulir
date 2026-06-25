import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  };

  const refreshOptions: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(
    payload as object,
    process.env.JWT_SECRET!,
    accessOptions
  );

  const refreshToken = jwt.sign(
    payload as object,
    process.env.JWT_REFRESH_SECRET!,
    refreshOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};
