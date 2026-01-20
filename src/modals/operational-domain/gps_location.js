import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class GpsLocation extends Model {}

GpsLocation.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    speed: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },

    heading: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },

    gps_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    received_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "GpsLocation",
    tableName: "gps_locations",
    timestamps: false, // gps_time + received_at already cover this
    underscored: true,
    indexes: [
      {
        fields: ["vehicle_id", "gps_time"],
      },
      {
        fields: ["vehicle_id", "received_at"],
      },
    ],
  }
);

export default GpsLocation;
