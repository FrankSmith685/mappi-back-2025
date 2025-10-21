import { RegisterInmuebleData } from "../interfaces/Inmuebles";

export const calcularPasoActual = (data: RegisterInmuebleData) => {
  const tienePaso1 = data.cod_tipo_inmueble && data.cod_subtipo_inmueble && data.cod_ubigeo && data.titulo && data.descripcion && data.operaciones?.length;
  const tienePaso2 = tienePaso1 && data.multimedias?.length;
  const tienePaso3 = tienePaso2 && (data.caracteristicas?.length || data.amoblamientos?.length || data.generales?.length);
  const tienePaso4 = tienePaso3 && data.precios?.length;

  if (tienePaso4) return 4;
  if (tienePaso3) return 3;
  if (tienePaso2) return 2;
  if (tienePaso1) return 1;
  return 0;
};
