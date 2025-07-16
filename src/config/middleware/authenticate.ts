import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../interfaces/Auth';

import dotenv from 'dotenv';
dotenv.config();

const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string;
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY as string;

const activeTokens: Record<string, string> = {};

export const generateToken = (
  username: string,
  data: any
): { accessToken: string; refreshToken: string } => {
  if (activeTokens[username]) {
    try {
      const token = activeTokens[username];
      const decodedToken = jwt.verify(token, ACCESS_SECRET_KEY) as TokenPayload;
      if (decodedToken.username === username) {
        return {
          accessToken: token,
          refreshToken: jwt.sign({ username }, REFRESH_SECRET_KEY, { expiresIn: '7d' }) // refresco nuevo
        };
      }
    } catch (err) {
      console.warn(`Token inválido para usuario ${username}:`, (err as Error).message);
    }
  }

  const payload: TokenPayload = { username, data };
  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ username }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
  activeTokens[username] = accessToken;

  return { accessToken, refreshToken };
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No se proporcionó el token de autenticación' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET_KEY) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido' });
  }
};
