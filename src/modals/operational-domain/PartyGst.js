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
      is_rcm_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "PartyGst",
    tableName: "party_gsts",
    timestamps: true,
    underscored: true,
  }
);

export default PartyGst;
