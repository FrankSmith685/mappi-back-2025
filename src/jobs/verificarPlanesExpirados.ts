import cron from "node-cron";
import { sequelize } from "../db";

const { PlanesUsuarios } = sequelize.models;

cron.schedule("0 0 * * *", async () => {
  console.log("Verificando expiración de planes, servicios y avisos...");

  try {
    // Actualizar planes expirados
    const [planesExpirados] = await sequelize.query(`
      UPDATE planes_usuarios
      SET PLUS_EstadoPlan = 'expirado'
      WHERE PLUS_FechaExpiracion < NOW() AND PLUS_EstadoPlan = 'activo';
    `);

    console.log(`Planes expirados actualizados: ${planesExpirados}`);

    // Desactivar servicios de usuarios sin plan activo
    const [serviciosDesactivados] = await sequelize.query(`
      UPDATE servicios
      SET SERV_Estado = false
      WHERE USUA_Interno IN (
        SELECT u.USUA_Interno
        FROM usuarios u
        LEFT JOIN planes_usuarios pu
          ON u.USUA_Interno = pu.USUA_Interno
          AND pu.PLUS_EstadoPlan = 'activo'
          AND (pu.PLUS_FechaExpiracion IS NULL OR pu.PLUS_FechaExpiracion >= NOW())
        WHERE pu.PLUS_Id IS NULL
      ) AND SERV_Estado = true;
    `);

    console.log(`Servicios desactivados: ${serviciosDesactivados}`);

    // Pausar avisos asociados a servicios desactivados
    const [avisosPausados] = await sequelize.query(`
      UPDATE avisos
      SET AVIS_Estado = 'pausado'
      WHERE SERV_Interno IN (
        SELECT SERV_Interno FROM servicios WHERE SERV_Estado = false
      )
      AND AVIS_Estado = 'publicado';
    `);

    console.log(`Avisos pausados: ${avisosPausados}`);

    console.log("Proceso de expiración completado correctamente.");
  } catch (error) {
    console.error(" Error en el cron de expiración:", error);
  }
});
