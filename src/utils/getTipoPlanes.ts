import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { TipoPlanAttributes, TipoPlanCreationAttributes } from '../interfaces/ITipoPlanes';

// Obtenemos el modelo de Sequelize
const TipoPlanes = sequelize.models.TipoPlanes as ModelStatic<
  Model<TipoPlanAttributes, TipoPlanCreationAttributes>
>;

// 🌟 Tipos de plan predeterminados
const tiposPredeterminados = [
  {
    nombre: "Plan Básico",
    descripcion: "Ideal para empezar. Te permite publicar tus primeros anuncios con funcionalidades esenciales.",
  },
  {
    nombre: "Plan Clásico",
    descripcion: "Perfecto para quienes buscan mayor visibilidad y opciones adicionales de personalización.",
  },
  {
    nombre: "Plan Chévere",
    descripcion: "El plan más completo, con beneficios premium y máxima exposición para tus anuncios.",
  },
];

export const getTipoPlanes = async (): Promise<void> => {
  try {
    const existentes = await TipoPlanes.findAll();

    if (existentes.length === 0) {
      const data: TipoPlanCreationAttributes[] = tiposPredeterminados.map((t) => ({
        TIPL_Nombre: t.nombre,
        TIPL_Descripcion: t.descripcion,
        TIPL_Estado: true,
      }));

      await TipoPlanes.bulkCreate(data);
      console.log('Se agregaron los datos de tipo de planes predeterminados.');
    } else {
      console.log('ℹYa existen datos en la tabla tipo_planes.');
    }
  } catch (error: any) {
    console.error('Error al guardar tipo de planes:', error.message);
  }
};
