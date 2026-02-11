import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class TbillMaster extends Model {}

TbillMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    bill_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    bill_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    gr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    bill_type: {
      type: DataTypes.ENUM(
        "NORMAL",
        "SUPPLEMENTARY",
        "DEBIT",
        "CREDIT"
      ),
      defaultValue: "NORMAL",
    },

    billing_party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    billing_party_gst_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    taxable_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },

    gst_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },

    other_charges_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },

    net_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },

    is_gst_applicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    gst_type: {
      type: DataTypes.ENUM("IGST", "CGST_SGST"),
      allowNull: true,
    },

    financial_year: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },

    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    bill_status: {
      type: DataTypes.ENUM("DRAFT", "POSTED", "CANCELLED"),
      defaultValue: "DRAFT",
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
      is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "bills",
    modelName: "TbillMaster",
    timestamps: true,
    underscored: true,
  }
);

export default TbillMaster;
