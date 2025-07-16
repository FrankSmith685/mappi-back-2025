import { Router } from 'express';

// Importa tus routers individuales
import authRouter from './authRouter';
import userRouter from './userRouter';
import documentRouter from './documentRouter';

const router = Router();

// Configurar los routers
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/document", documentRouter);




export default router;
