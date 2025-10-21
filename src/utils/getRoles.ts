// src/seed/rolesSeeder.ts
import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { RolAttributes, RolCreationAttributes } from '../interfaces/IRoles';

const Roles = sequelize.models.Roles as ModelStatic<Model<RolAttributes, RolCreationAttributes>>;

const rolesPredeterminados = [
  { nombre: 'admin', descripcion: 'Administrador con todos los permisos' },
  { nombre: 'usuario', descripcion: 'Usuario estándar' },
  { nombre: 'moderador', descripcion: 'Puede moderar contenido y usuarios' },
];

export const getRoles = async (): Promise<void> => {
  try {
    const existentes = await Roles.findAll();

    if (existentes.length === 0) {
      const data: RolCreationAttributes[] = rolesPredeterminados.map(r => ({
        ROLE_Nombre: r.nombre,
        ROLE_Descripcion: r.descripcion,
      }));

      await Roles.bulkCreate(data);
      console.log('Se agregaron roles predeterminados a la tabla roles');
    } else {
      console.log('Ya existen datos en la tabla roles');
    }
  } catch (error: any) {
    console.log('Error al sembrar roles: ' + error.message);
  }
};
