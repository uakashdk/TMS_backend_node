import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Trip extends Model {}

Trip.init(
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

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    primary_driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    secondary_driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    operation_manager_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    trip_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    expected_delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    route_summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    trip_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PLANNED',
    },

    total_distance_km: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Trip',
    tableName: 'trips',
    timestamps: true,
    underscored: true,
  }
);

export default Trip;
