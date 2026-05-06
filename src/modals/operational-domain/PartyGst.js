import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class PartyGst extends Model {}

PartyGst.init(
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

    gst_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // 🔥 IMPORTANT
    },

    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    gst_registration_type: {
      type: DataTypes.ENUM("regular", "composition", "unregistered"),
      allowNull: false,
      defaultValue: "regular",
    },

    gst_nature: {
      type: DataTypes.ENUM("fcm", "rcm"),
      allowNull: false,
    },

    billing_type: {
      type: DataTypes.ENUM("igst", "cgst_sgst"), // 🔥 NEW (IMPORTANT)
      allowNull: false,
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "PartyGst",
    tableName: "party_gsts",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["party_id"],
      },
      {
        fields: ["company_id"],
      },
    ],
  }
);

export default PartyGst;