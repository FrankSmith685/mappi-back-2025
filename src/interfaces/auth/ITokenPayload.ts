import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  username: string;
  data?: any;
  iat?: number;
  exp?: number;
}