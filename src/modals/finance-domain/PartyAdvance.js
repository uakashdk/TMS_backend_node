// models/PartyAdvance.js
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

    advance_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    advance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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

    status: {
      type: DataTypes.ENUM("OPEN", "PARTIALLY_ADJUSTED", "CLOSED"),
      allowNull: false,
      defaultValue: "OPEN",
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
