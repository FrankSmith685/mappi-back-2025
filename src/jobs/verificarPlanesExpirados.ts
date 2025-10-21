import cron from "node-cron";
import { sequelize } from "../db";

const { PlanesUsuarios } = sequelize.models;

// Ejecuta cada día a las 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("Verificando planes expirados...");

  try {
    const [resultado] = await sequelize.query(`
      UPDATE planes_usuarios
      SET PLUS_EstadoPlan = 'expirado'
      WHERE PLUS_FechaExpiracion < NOW() AND PLUS_EstadoPlan = 'activo';
    `);

    console.log(`Planes actualizados como expirados:`, resultado);
  } catch (error) {
    console.error("Error al actualizar planes expirados:", error);
  }
});
