import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Route extends Model {}

Route.init(
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

    route_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    source_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    destination_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    estimated_travel_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'Route',
    tableName: 'routes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['company_id', 'source_city', 'destination_city'],
      },
    ],
  }
);

export default Route;
