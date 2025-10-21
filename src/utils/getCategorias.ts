// src/seed/categoriasSeeder.ts
import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { CategoriaAttributes, CategoriaCreationAttributes } from '../interfaces/ICategoria';

const Categorias = sequelize.models.Categorias as ModelStatic<Model<CategoriaAttributes, CategoriaCreationAttributes>>;

const categoriasPredeterminadas = [
  { nombre: 'Bar', descripcion: 'Lugar para bebidas y tragos' },
  { nombre: 'Comida al paso', descripcion: 'Comida rápida y accesible' },
  { nombre: 'Postres y café', descripcion: 'Dulces, repostería y cafeterías' },
  { nombre: 'Restaurantes', descripcion: 'Establecimientos de comida variada' },
  { nombre: 'Otros', descripcion: 'Categorías diversas' },
  { nombre: 'Reseñas', descripcion: 'Opiniones y valoraciones' },
];

export const getCategorias = async (): Promise<void> => {
  try {
    const existentes = await Categorias.findAll();

    if (existentes.length === 0) {
      const data: CategoriaCreationAttributes[] = categoriasPredeterminadas.map(c => ({
        CATE_Nombre: c.nombre,
        CATE_Descripcion: c.descripcion,
      }));

      await Categorias.bulkCreate(data);
      console.log('Se agregaron categorías predeterminadas a la tabla categorias');
    } else {
      console.log('Ya existen datos en la tabla categorias');
    }
  } catch (error: any) {
    console.log('Error al sembrar categorias: ' + error.message);
  }
};
