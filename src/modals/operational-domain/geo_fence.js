import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class GeoFence extends Model {}

GeoFence.init(
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

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    fence_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // YARD | HUB | CLIENT | CITY
    },

    center_latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    center_longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    radius_meters: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    is_active: {
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
    modelName: "GeoFence",
    tableName: "geo_fences",
    timestamps: true,
    underscored: true,
  }
);

export default GeoFence;
