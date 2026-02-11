import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class Invoice extends Model {}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    billing_party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    billing_party_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    billing_gst_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    billing_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    place_of_supply_state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    invoice_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    financial_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },

    gst_type: {
      type: DataTypes.ENUM("IGST", "CGST_SGST"),
      allowNull: true,
    },

    is_gst_applicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    taxable_amount: {
      type: DataTypes.DECIMAL(12,2),
      defaultValue: 0,
    },

    gst_amount: {
      type: DataTypes.DECIMAL(12,2),
      defaultValue: 0,
    },

    round_off: {
      type: DataTypes.DECIMAL(12,2),
      defaultValue: 0,
    },

    net_amount: {
      type: DataTypes.DECIMAL(12,2),
      defaultValue: 0,
    },

    invoice_status: {
      type: DataTypes.ENUM("DRAFT", "ISSUED", "CANCELLED"),
      defaultValue: "DRAFT",
    },

    payment_status: {
      type: DataTypes.ENUM("UNPAID", "PARTIAL", "PAID"),
      defaultValue: "UNPAID",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "invoices",
    modelName: "Invoice",
    timestamps: true,
    underscored: true,
  }
);

export default Invoice;
