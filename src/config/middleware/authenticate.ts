import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TokenPayload } from '../../interfaces/auth';

dotenv.config();

const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string;
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY as string;

export const generateToken = (
  username: string,
  data?: any
): { accessToken: string; refreshToken: string } => {
  const payload: TokenPayload = { username, data };
  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: "7d" });
  const refreshToken = jwt.sign({ username }, REFRESH_SECRET_KEY, { expiresIn: "2h" });

  return { accessToken, refreshToken };
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No se proporcionó el token de autenticación" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET_KEY) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token no válido o expirado" });
  }
};
