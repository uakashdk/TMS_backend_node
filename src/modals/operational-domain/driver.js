import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Driver extends Model {}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address_line_1: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address_line_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city_town_village_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    state_province_region_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    country_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pin_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    driver_license_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    driver_license_expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    driver_license_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    profile_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_active: {
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:"Y"
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['company_id', 'phone_number'],
      },
      {
        unique: true,
        fields: ['company_id', 'driver_license_number'],
      },
    ],
  }
);

export default Driver;
