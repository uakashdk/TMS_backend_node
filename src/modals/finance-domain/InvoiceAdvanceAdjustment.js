// models/InvoiceAdvanceAdjustment.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class InvoiceAdvanceAdjustment extends Model {}

InvoiceAdvanceAdjustment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    invoice_id: {
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
  },
  {
    sequelize,
    modelName: "InvoiceAdvanceAdjustment",
    tableName: "invoice_advance_adjustments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["invoice_id", "party_advance_id"],
      },
    ],
  }
);

export default InvoiceAdvanceAdjustment;
