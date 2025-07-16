import { Request, Response } from 'express';

type VerifierFunction = (value: string) => Promise<{ success: boolean; message: string }>;

export const createVerifierHandler = (
  paramName: string,
  verifierFn: VerifierFunction
) => {
  return async (req: Request, res: Response) => {
    try {
      const value = req.query[paramName];

      if (typeof value !== 'string' || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `El parámetro "${paramName}" es requerido y debe ser un string válido.`,
        });
      }

      const result = await verifierFn(value);
      return res.status(200).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = {
          success: false,
          message: `Error inesperado al verificar el parámetro "${paramName}".`,
        };
      }

      return res.status(404).json(parsedError);
    }
  };
};
