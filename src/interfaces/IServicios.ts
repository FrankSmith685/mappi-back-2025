export interface CategoriaData {
  cod_categoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface SubcategoriaData {
  cod_subcategoria?: number;
  nombre?: string;
  descripcion?: string | null;
  categoria?: CategoriaData | null; // ✅ ← agrega esto
}

export interface DireccionData {
  interno: string;
  codigo_ubigeo: string;
  direccion: string;
  referencia?: string | null;
  tipo?: string | null;
  predeterminada?: boolean;
  tipo_entidad?: string | null;
  cod_entidad?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface ArchivoData {
  id: string;
  tipo: string;
  nombreOriginal: string;
  ruta: string;
  fechaSubida: string;
}

export interface UsuarioData {
  cod_usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface EmpresaData {
  cod_empresa: string;
  razonSocial: string;
  ruc: string;
  telefono?: string | null;
  email?: string | null;
}

// interfaces/IServicio.ts
export interface ServicioAttributes {
  SERV_Interno: string;        // PK
  SERV_Nombre: string;
  SERV_Descripcion?: string | null;
  SERV_Estado: boolean;
  SERV_Archivado: boolean;
  SERV_FechaRegistro: Date;
  USUA_Interno: string;        // FK → usuarios
  SUBC_Id: number;             // FK → subcategorias
  SERV_Abierto24h: boolean;
  SERV_HoraInicio: string;
  SERV_HoraFin: string;
  SERV_Delivery: boolean
}

// Para creación: algunos campos se generan automáticamente
export type ServicioCreationAttributes = Omit<
  ServicioAttributes,
  "SERV_Interno" | "SERV_FechaRegistro" | "SERV_Estado"
> & {
  SERV_Interno?: string;         // lo puedes generar tú (uuid) o dejar que Sequelize lo maneje
  SERV_FechaRegistro?: Date;
  SERV_Estado?: boolean;
};


export interface ServicioData {
  cod_servicio?: string | null;      // SERV_Interno
  nombre?: string;                   // SERV_Nombre
  descripcion?: string | null;       // SERV_Descripcion
  estado?: boolean;                  // SERV_Estado
  fechaRegistro?: string;            // SERV_FechaRegistro
  cod_usuario?: string;              // USUA_Interno
  subcategoria?: SubcategoriaData | null;
  direccion?: DireccionData | null; // ✅ AGREGA ESTO
  archivos?: ArchivoData[];
  usuario?: UsuarioData | null;
  empresa?: EmpresaData | null;

  abierto24h?: boolean;              // SERV_Abierto24h
  horaInicio?: string | null;        // SERV_HoraInicio
  horaFin?: string | null;           // SERV_HoraFin
  delivery?: boolean;                // SERV_Delivery
  archivado?: boolean;
}

