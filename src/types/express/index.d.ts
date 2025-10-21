import "express";
import { TokenPayload } from "../../interfaces/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
  }
}
