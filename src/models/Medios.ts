import { Sequelize, DataTypes, Model } from 'sequelize';
import { MediosAttributes, MediosCreationAttributes} from '../interfaces/Medios';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<MediosAttributes, MediosCreationAttributes>>('Medios', {
    cod_medios: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: false,
  });
};
