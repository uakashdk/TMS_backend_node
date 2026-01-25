import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js"; // adjust path if needed

class VehicleDriverAssignment extends Model {}

VehicleDriverAssignment.init(
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

    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    start_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
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

    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "VehicleDriverAssignment",
    tableName: "vehicle_driver_assignments",
    timestamps: false, // using your own created_at / updated_at
    underscored: true,
  }
);

export default VehicleDriverAssignment;
