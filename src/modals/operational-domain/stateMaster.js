import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class StateMaster extends Model {}

StateMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    state_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    state_code: {
      type: DataTypes.STRING(2), // e.g., IN state code
      allowNull: false,
      unique: true,
    },
    country_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'India',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'StateMaster',
    tableName: 'state_master',
    timestamps: true,
    underscored: true,
  }
);

export default StateMaster;
