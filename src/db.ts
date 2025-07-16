// src/db.ts
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { defineRelations } from './models/relations';

dotenv.config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env;

export const sequelize = new Sequelize(
  `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    logging: false,
    native: false,
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ Conexión exitosa a la base de datos"))
  .catch((err) => console.error("❌ Error al conectar a la base de datos", err));

// Cargar modelos
const modelDefiners: ((sequelize: Sequelize) => void)[] = [];
const basename = path.basename(__filename);

// Leer todos los archivos de modelos
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) =>
    file.endsWith('.ts') &&
    file !== basename &&
    file !== 'relations.ts' // <== excluye archivos que no son modelos
    )

  .forEach((file) => {
    const model = require(path.join(__dirname, '/models', file)).default;
    modelDefiners.push(model);
  });

// Inyectar sequelize a cada modelo
modelDefiners.forEach(model => model(sequelize));

// Capitalizar nombres sin reasignar sequelize.models
for (const [key, value] of Object.entries(sequelize.models)) {
  const capitalizedKey = key[0].toUpperCase() + key.slice(1);
  if (capitalizedKey !== key) {
    (sequelize.models as any)[capitalizedKey] = value;
    delete (sequelize.models as any)[key];
  }
}

// Relaciones (puedes mover esto a otro archivo si deseas)  
defineRelations(sequelize);

// Exportar
export const conn = sequelize;
