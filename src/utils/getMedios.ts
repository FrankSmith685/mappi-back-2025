import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { MediosAttributes, MediosCreationAttributes } from '../interfaces/Medios';

const Medios = sequelize.models.Medios as ModelStatic<Model<MediosAttributes, MediosCreationAttributes>>;


const medios = ["email", "SMS", "push notification","in-app notification","WhatsApp","phone call"];

export const getMedios = async (): Promise<void> => {
  try {
    const medio = await Medios.findAll();

    if (medio.length === 0) {
      const dataMedios: MediosCreationAttributes[] = medios.map((nombre) => ({
        nombre,
      }));

      await Medios.bulkCreate(dataMedios);
      console.log("Se agregaron los datos de medios a la tabla.");
    } else {
      console.log("Ya existen datos en la tabla de medios.");
    }
  } catch (err: any) {
    console.log("Error: " + err.message);
  }
};
