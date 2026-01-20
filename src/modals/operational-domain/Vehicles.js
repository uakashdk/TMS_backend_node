import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Vehicle extends Model {}

Vehicle.init(
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

    vehicle_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    vehicle_type: {
      type: DataTypes.STRING,
      allowNull: false,
      // TRUCK | CONTAINER | TRAILER | TEMPO
    },

    capacity_weight_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    capacity_volume_cbm: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    fuel_type: {
      type: DataTypes.STRING,
      allowNull: false,
      // DIESEL | PETROL | CNG | ELECTRIC
    },

    rc_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    insurance_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    permit_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    fitness_expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isMkt:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:"N"
    },
     is_active:{
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
    modelName: 'Vehicle',
    tableName: 'vehicles',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['company_id', 'vehicle_number'],
      },
    ],
  }
);

export default Vehicle;
