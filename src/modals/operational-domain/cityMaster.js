import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";
import StateMaster from './stateMaster.js';

class CityMaster extends Model {}

CityMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    city_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'state_master',
        key: 'id',
      },
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CityMaster',
    tableName: 'city_master',
    timestamps: true,
    underscored: true,
  }
);

export default CityMaster;
