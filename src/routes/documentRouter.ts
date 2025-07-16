import { Router, Request, Response } from 'express';
import { documentType } from '../controllers/documentController';


const router = Router();

router.get('/document-type', async (req: Request, res: Response) => {
  try {
    const tipoDocumento = await documentType();
    res.status(200).json(tipoDocumento);
  } catch (error: any) {
    return res.status(404).send(error.message);
  }
});

export default router;