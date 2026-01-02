import { DataTypes, Model } from "sequelize";
import sequelize from "../../Config/Db.js";

class Company extends Model {}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    company_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

export default Company;
