import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/Ubigeos';
import ubigeo from 'ubigeo-peru';

const Ubigeos = sequelize.models.Ubigeos as ModelStatic<Model<UbigeoAttributes, UbigeoCreationAttributes>>;

export const getUbigeos = async (): Promise<void> => {
  try {
    const existingUbigeos = await Ubigeos.findAll();

    if (existingUbigeos.length === 0) {
      const ubigeoArray = Object.values(ubigeo).flat();

      const dataUbigeos: UbigeoCreationAttributes[] = ubigeoArray.map(
        ({ departamento, provincia, distrito, nombre }) => ({
          departamento,
          provincia,
          distrito,
          nombre,
        })
      );

      await Ubigeos.bulkCreate(dataUbigeos);
      console.log('Se agregaron los datos de ubigeo a la tabla.');
    } else {
      console.log('Ya existen datos en la tabla de ubigeos.');
    }
  } catch (error: any) {
    console.error('Error al cargar los ubigeos:', error.message);
  }
};
