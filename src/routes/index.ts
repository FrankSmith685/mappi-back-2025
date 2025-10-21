import { Router } from 'express';

// Importa tus routers individuales
import authRouter from './authRouter';
import userRouter from './userRouter';
import documentRouter from './documentRouter';
import archivosRouter from './archivoRouter';
import notificacionesRouter from './notificacionesRouter';
import ubigeosRouter from './ubigeoRouter';
import empresaRouter from './empresaRouter';
import avisoRouter from './avisosRouter';
import categoriaRouter from './categoriaRouter';
import servicioRouter from './servicioRouter';
import direccionesRouter from './direccionesRouter';
import planesRouter from './planesRouter';
import planesUsuarioRouter from "./planesUsuariosRouter"
import cursosRouter from "./cursosRouter"

const router = Router();

// Configurar los routers
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/document", documentRouter);
router.use("/archivos", archivosRouter);
router.use("/notificaciones", notificacionesRouter);
router.use("/ubigeos", ubigeosRouter);
router.use("/empresa", empresaRouter);
router.use("/aviso", avisoRouter);
router.use("/categoria", categoriaRouter);
router.use("/servicio", servicioRouter);
router.use("/direcciones", direccionesRouter);
router.use("/planes", planesRouter);
router.use("/planes-usuario", planesUsuarioRouter); 
router.use("/cursos", cursosRouter); 

export default router;
