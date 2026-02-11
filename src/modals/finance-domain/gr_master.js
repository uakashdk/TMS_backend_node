import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class GR extends Model {}

GR.init(
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

    billing_party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    billing_party_gst_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    billing_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    consignor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    consignee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gr_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gr_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    gst_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    gst_type: {
      type: DataTypes.ENUM("IGST", "CGST_SGST", "EXEMPT"),
      allowNull: true,
    },

    reverse_charge: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    freight_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    freight_basis: {
      type: DataTypes.ENUM("PER_TRIP", "PER_TON", "PER_KM", "FIXED"),
      allowNull: false,
      defaultValue: "PER_TRIP",
    },

    declared_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "INVOICED", "CLOSED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    place_of_supply_state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rcm_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "GR",
    tableName: "grs",
    timestamps: true,
    underscored: true,
  }
);

export default GR;
