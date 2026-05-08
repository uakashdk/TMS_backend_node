// ========================================
// models/JobAdvanceAdjustment.js
// ========================================

import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class JobAdvanceAdjustment extends Model {}

JobAdvanceAdjustment.init(
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

    party_advance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    adjusted_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    adjustment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "JobAdvanceAdjustment",
    tableName: "job_advance_adjustments",
    timestamps: true,
    underscored: true,
  }
);

export default JobAdvanceAdjustment;