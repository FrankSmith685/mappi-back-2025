import { TipoDocumento } from "./TipoDocumentos";

export interface Documento{
    cod_usuario: string;
  cod_tipo_documento: number;
  nro_documento: string;
  TipoDocumentos?: TipoDocumento;
}