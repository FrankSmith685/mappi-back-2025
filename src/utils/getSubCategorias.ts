// src/seed/subcategoriasSeeder.ts
import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { SubcategoriaAttributes, SubcategoriaCreationAttributes } from '../interfaces/ISubcategoria';

const Subcategorias = sequelize.models.Subcategorias as ModelStatic<Model<SubcategoriaAttributes, SubcategoriaCreationAttributes>>;
const Categorias = sequelize.models.Categorias;

// Definimos las subcategorías agrupadas por nombre de categoría
const subcategoriasPredeterminadas: Record<string, string[]> = {
  'Bar': ['Licoreria', 'Restobar'],
  'Comida al paso': [
    'Anticuchos', 'Broster', 'Caldos', 'Cevicheria carretillero', 'Chancho al palo',
    'Chicharrones', 'Desayunos', 'Dulces', 'Emoliente', 'Hamburguesas',
    'Hígado frito', 'Salchipapa'
  ],
  'Otros': ['Otros'],
  'Postres y café': ['Cafeteria', 'Chicharroneria', 'Heladeria', 'Jugueria', 'Panaderias', 'Pasteleria'],
  'Reseñas': ['Reseñas'],
  'Restaurantes': [
    'Cevicheria', 'Chifa', 'Comida Criolla', 'Comida de la Selva', 'Comida Saludable',
    'Menu del dia', 'Pastas', 'Pescados y mariscos', 'Polleria'
  ]
};

export const getSubCategorias = async (): Promise<void> => {
  try {
    const existentes = await Subcategorias.findAll();

    if (existentes.length === 0) {
      // obtenemos todas las categorías primero
      const categorias = await Categorias.findAll();

      const data: SubcategoriaCreationAttributes[] = [];

      categorias.forEach((cat: any) => {
        const nombreCat = cat.CATE_Nombre as keyof typeof subcategoriasPredeterminadas;
        const listaSub = subcategoriasPredeterminadas[nombreCat];

        if (listaSub) {
          listaSub.forEach(sub => {
            data.push({
              SUBC_Nombre: sub,
              SUBC_Descripcion: `Subcategoría de ${nombreCat}`,
              CATE_Id: cat.CATE_Id
            });
          });
        }
      });

      if (data.length > 0) {
        await Subcategorias.bulkCreate(data);
        console.log('Se agregaron subcategorías predeterminadas a la tabla subcategorias');
      } else {
        console.log('No se encontraron categorías para asignar subcategorías');
      }
    } else {
      console.log('Ya existen datos en la tabla subcategorias');
    }
  } catch (error: any) {
    console.log('Error al sembrar subcategorias: ' + error.message);
  }
};
