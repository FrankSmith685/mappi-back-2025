import { sequelize } from '../db';
import { Model, ModelStatic } from 'sequelize';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/IUbigeos';
import { ubigeoINEI } from 'peru-utils';

const Ubigeos = sequelize.models.Ubigeos as ModelStatic<Model<UbigeoAttributes, UbigeoCreationAttributes>>;

interface CodeName {
  code: string;
  name: string;
}

const normalizeList = (list: any): CodeName[] => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((x): x is { code: string; name: string } => !!x && typeof x.code === 'string' && typeof x.name === 'string')
    .map((x) => ({ code: x.code, name: x.name }));
};

export const getUbigeos = async (): Promise<void> => {
  try {
    if (!Ubigeos) throw new Error('Modelo Ubigeos no definido.');

    const existentes = await Ubigeos.findAll();
    if (existentes.length > 0) {
      console.log('Ya existen ubigeos en la tabla, se omite la carga.');
      return;
    }

    const payload: UbigeoCreationAttributes[] = [];

    // 1. Departamentos
    const departamentosRaw = await ubigeoINEI.getDepartments();
    const departamentos: CodeName[] = normalizeList(departamentosRaw);

    for (const dept of departamentos) {
      // 2. Provincias dentro del departamento
      const provinciasRaw = await ubigeoINEI.getProvince(dept.code);
      const provincias: CodeName[] = normalizeList(provinciasRaw);

      for (const prov of provincias) {
        // 3. Distritos dentro de la provincia
        const distritosRaw = await ubigeoINEI.getDistrict(prov.code);
        const distritos: CodeName[] = normalizeList(distritosRaw);

        for (const dist of distritos) {
          payload.push({
            UBIG_Codigo: dist.code,
            UBIG_Departamento: dept.name,
            UBIG_Provincia: prov.name,
            UBIG_Distrito: dist.name,
          });
        }
      }
    }

    if (payload.length === 0) {
      console.log('No se generó ningún ubigeo desde la librería.');
      return;
    }

    await Ubigeos.bulkCreate(payload);
    console.log('Se cargaron los datos de ubigeos.');
  } catch (error: any) {
    console.log('Error al sembrar ubigeos: ' + error.message);
  }
};
