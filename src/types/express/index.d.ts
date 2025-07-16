import { TokenPayload } from '../../utils/auth'; // ajusta la ruta según tu proyecto

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}
