import { DataTypes } from 'sequelize';
import sequelize from '../../Config/Db.js';

const TripLog = sequelize.define(
  'TripLog',
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

    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    log_type: {
      type: DataTypes.STRING,
      allowNull: false,
      // e.g. STATUS_CHANGE, LOCATION_UPDATE, NOTE, START, END
    },

    log_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    logged_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    location_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    odometer_reading_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    logged_by_role: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logged_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'trip_logs',
    timestamps: true,
    underscored: true,
  }
);

export default TripLog;
