// helpers/credentialsHandler.ts
import { Request, Response } from 'express';

export const createCredentialHandler = (
  handler: (correo: string, contraseña: string) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    try {
      const { correo, contraseña } = req.body;

      if (!correo || !contraseña) {
        return res.status(400).json({
          success: false,
          message: 'Correo y contraseña son requeridos.',
        });
      }

      const result = await handler(correo, contraseña);
      return res.status(200).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = {
          success: false,
          message: 'Error inesperado en la operación.',
        };
      }

      return res.status(400).json(parsedError);
    }
  };
};


export const createRegisterHandler = (
  handler: (data: any) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await handler(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = {
          success: false,
          message: 'Error inesperado al registrar el usuario.',
        };
      }

      return res.status(400).json(parsedError);
    }
  };
};