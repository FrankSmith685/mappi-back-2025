import { sequelize } from '../db';
import { cleanUbigeoParts } from '../helpers/cleanUbigeo';
import fetch from "node-fetch"; 

const { Ubigeos, Direcciones, Servicios } = sequelize.models;

// 1. Obtener departamentos
export const getDepartamentos = async (): Promise<{ success: boolean; message: string; data: string[] }> => {
  try {
    const departamentos = await Ubigeos.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('UBIG_Departamento')), 'departamento']],
      raw: true,
    });


    if (departamentos.length === 0) {
      throw new Error("No se encontraron departamentos");
    }

    return {
      success: true,
      message: 'Departamentos encontrados',
      data: departamentos.map((d: any) => d.departamento),
    };
  } catch (error: any) {
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};

// 2. Obtener provincias de un departamento
export const getProvincias = async (
  departamento: string
): Promise<{ success: boolean; message: string; data: string[] }> => {
  try {
    const provincias = await Ubigeos.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('UBIG_Provincia')), 'provincia'],
      ],
      where: { UBIG_Departamento: departamento },
      raw: true,
    });

    if (provincias.length === 0) {
      throw new Error("No se encontraron provincias");
    }

    return {
      success: true,
      message: 'Provincias encontradas',
      data: provincias.map((p: any) => p.provincia),
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};

// 3. Obtener distritos de una provincia
export const getDistritos = async (
  departamento: string,
  provincia: string
): Promise<{ success: boolean; message: string; data: string[] }> => {
  try {
    const distritos = await Ubigeos.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('UBIG_Distrito')), 'distrito'],
      ],
      where: { 
        UBIG_Departamento: departamento,
        UBIG_Provincia: provincia,
      },
      raw: true,
    });

    if (distritos.length === 0) {
      throw new Error("No se encontraron distritos");
    }

    return {
      success: true,
      message: 'Distritos encontrados',
      data: distritos.map((d: any) => d.distrito),
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};


// Definimos la interfaz de la respuesta de Nominatim
interface NominatimResponse {
  address: {
    state?: string;
    city?: string;
    town?: string;
    suburb?: string;
    county?: string;
  };
  display_name?: string;
}

export const getUbigeoByCoords = async (
  lat: number,
  lng: number
): Promise<{
  success: boolean;
  message: string;
  data: { dep: string; prov: string; dist: string; direccion: string } | null;
}> => {
  try {

    const controller = new AbortController();

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
            headers: {
            "User-Agent": "mi-app/1.0 f.s.b.rojas@gmail.com",
            },
            signal: controller.signal,
        }
    );

    if (!res.ok) throw new Error(`Error en la petición: ${res.status}`);

    // Aquí forzamos a que el JSON sea de tipo NominatimResponse
    const data = (await res.json()) as NominatimResponse;

    const dep = data.address.state || "";
    let prov = data.address.city || data.address.town || "";
    let dist = data.address.suburb || data.address.county || "";
    const direccion = data.display_name || "";

    // Corrección especial para Callao
    if (dep.toLowerCase() === "callao") {
      prov = "Callao";
      dist = data.address.city || data.address.town || data.address.suburb || dist;
    }

    return {
      success: true,
      message: "Ubigeo encontrado",
      data: { dep, prov, dist, direccion },
    };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};

// 4. Obtener cod_ubigeo desde dep, prov, dist
export const getCodUbigeo = async (
  dep: string,
  prov: string,
  dist: string
): Promise<{ success: boolean; message: string; data: { cod_ubigeo: string } | null }> => {
  try {
    const ubigeo = await Ubigeos.findOne({
      attributes: [["UBIG_Codigo", "cod_ubigeo"]],
      where: {
        UBIG_Departamento: dep,
        UBIG_Provincia: prov,
        UBIG_Distrito: dist,
      },
      raw: true,
    }) as { cod_ubigeo: string } | null;

    if (!ubigeo) {
      return { success: false, message: "No se encontró cod_ubigeo", data: null };
    }

    return {
      success: true,
      message: "Cod_ubigeo encontrado",
      data: { cod_ubigeo: ubigeo.cod_ubigeo },
    };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};


interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export const getCoordsByUbigeo = async (
  dep: string,
  prov: string,
  dist: string
): Promise<{ success: boolean; message: string; data: { lat: number; lng: number } | null }> => {
  try {
    const query = cleanUbigeoParts([dist, prov, dep, "Perú"]).join(", ");

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}`
    );

    const data = (await res.json()) as NominatimSearchResult[];

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        success: true,
        message: "Coordenadas encontradas",
        data: { lat: parseFloat(lat), lng: parseFloat(lon) },
      };
    }

    return { success: false, message: "No se encontraron coordenadas", data: null };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};


// 6. Buscar direcciones (autocomplete con Nominatim)
export const searchDirecciones = async (
  query: string | null,
  dep: string,
  dist: string
): Promise<{ success: boolean; message: string; data: { label: string; lat: number; lng: number }[] }> => {
  try {
    if (!query) {
      return { success: true, message: "Consulta vacía", data: [] };
    }

    const fullQuery = cleanUbigeoParts([query || "", dist, dep, "Perú"]).join(", ");
    // Solo usamos el query para autocompletar calles
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&q=${encodeURIComponent(fullQuery)}`
    );

    const data = await res.json();

    if (Array.isArray(data)) {
      const direcciones = data
        .map((d: any) => {
          const calle =
            d.address.road ||
            d.address.pedestrian ||
            d.address.cycleway ||
            d.address.footway ||
            d.display_name.split(",")[0];
          return {
            label: calle,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          };
        })
        .filter(d => d.label);

      return { success: true, message: "Direcciones encontradas", data: direcciones };
    }

    return { success: false, message: "No se encontraron direcciones", data: [] };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
};

// 7. Obtener coordenadas exactas de una dirección
export const getCoordsByDireccion = async (
  s: string,   // ej. "Av. Siempre Viva 742"
  dep: string,
  dist: string
): Promise<{ success: boolean; message: string; data: { lat: number; lng: number } | null }> => {
  try {
    if (!s) {
      return { success: false, message: "La dirección está vacía", data: null };
    }

    const fullQuery = cleanUbigeoParts([s, dist, dep, "Perú"]).join(", ");

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fullQuery)}`
    );

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        success: true,
        message: 'Coordenadas encontradas',
        data: { lat: parseFloat(lat), lng: parseFloat(lon) },
      };
    }

    return { success: false, message: "No se encontraron coordenadas", data: null };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};


export const getUbigeoByCodigo = async (
  codigo: string
): Promise<{ success: boolean; message: string; data: { departamento: string; provincia: string; distrito: string } | null }> => {
  try {
    const ubigeo = await Ubigeos.findOne({
      attributes: [
        ["UBIG_Departamento", "departamento"],
        ["UBIG_Provincia", "provincia"],
        ["UBIG_Distrito", "distrito"],
      ],
      where: { UBIG_Codigo: codigo },
      raw: true,
    }) as { departamento: string; provincia: string; distrito: string } | null;

    if (!ubigeo) {
      return { success: false, message: "No se encontró ubigeo con ese código", data: null };
    }

    return {
      success: true,
      message: "Ubigeo encontrado",
      data: ubigeo,
    };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};

export const getDepartamentosConServiciosActivos = async (): Promise<
  { codigo_ubigeo: string; departamento: string; total_servicios: number }[]
> => {
  try {
    type Departamento = { UBIG_Codigo: string; UBIG_Departamento: string };
    type Direccion = { DIUS_CodigoUbigeo: string; DIUS_Cod_Entidad: string };
    type Servicio = { SERV_Interno: string };

    //  Obtener todos los ubigeos (distritos) con su departamento
    const ubigeos = (await Ubigeos.findAll({
      attributes: ["UBIG_Codigo", "UBIG_Departamento"],
      raw: true,
    })) as unknown as Departamento[];

    // Crear un mapa único de departamentos
    const mapaDepartamentos = new Map<string, string>();
    for (const u of ubigeos) {
      const codDepartamento = u.UBIG_Codigo.substring(0, 2);
      if (!mapaDepartamentos.has(codDepartamento)) {
        mapaDepartamentos.set(codDepartamento, u.UBIG_Departamento);
      }
    }

    //  Direcciones de tipo servicio
    const direccionesServicios = (await Direcciones.findAll({
      attributes: ["DIUS_CodigoUbigeo", "DIUS_Cod_Entidad"],
      where: { DIUS_Tipo_Entidad: "servicio" },
      raw: true,
    })) as unknown as Direccion[];

    // Servicios activos
    const serviciosActivos = (await Servicios.findAll({
      where: { SERV_Estado: true },
      attributes: ["SERV_Interno"],
      raw: true,
    })) as unknown as Servicio[];

    const serviciosActivosSet = new Set(serviciosActivos.map(s => s.SERV_Interno));

    //  Contar servicios activos por departamento
    const conteoServiciosPorDepartamento: Record<string, number> = {};

    for (const dir of direccionesServicios) {
      if (serviciosActivosSet.has(dir.DIUS_Cod_Entidad)) {
        const codDepartamento = dir.DIUS_CodigoUbigeo.substring(0, 2);
        conteoServiciosPorDepartamento[codDepartamento] =
          (conteoServiciosPorDepartamento[codDepartamento] || 0) + 1;
      }
    }

    //  Siempre devolver todos los departamentos, incluso si tienen 0 servicios
    const resultado = Array.from(mapaDepartamentos.entries()).map(([codigo, nombre]) => ({
      codigo_ubigeo: codigo,
      departamento: nombre,
      total_servicios: conteoServiciosPorDepartamento[codigo] || 0,
    }));

    return resultado;
  } catch (error: any) {
    console.error(" Error al obtener departamentos con servicios activos:", error);
    return [];
  }
};
