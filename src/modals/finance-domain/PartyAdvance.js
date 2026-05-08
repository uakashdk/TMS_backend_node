// ==============================
// models/PartyAdvance.js
// ==============================

import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class PartyAdvance extends Model {}

PartyAdvance.init(
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

    party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    advance_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    advance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    advance_type: {
      type: DataTypes.ENUM(
        "JOB_ADVANCE",
        "ON_ACCOUNT"
      ),
      allowNull: false,
      defaultValue: "JOB_ADVANCE",
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    adjusted_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    balance_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.ENUM(
        "CASH",
        "BANK",
        "UPI",
        "NEFT",
        "RTGS",
        "CHEQUE"
      ),
      allowNull: false,
    },

    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "PARTIALLY_ADJUSTED",
        "CLOSED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
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
    modelName: "PartyAdvance",
    tableName: "party_advances",
    timestamps: true,
    underscored: true,
  }
);

export default PartyAdvance;