import { UbigeoAttributes } from "../interfaces/Ubigeos";

declare module 'ubigeo-peru' {
  const ubigeo: {
    [key: string]: UbigeoAttributes[];
  };

  export = ubigeo;
}
