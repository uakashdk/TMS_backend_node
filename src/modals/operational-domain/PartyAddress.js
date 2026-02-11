import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class PartyAddress extends Model {}

PartyAddress.init(
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

    address_type: {
      type: DataTypes.ENUM("pickup", "delivery", "billing", "office"),
      allowNull: false,
    },

    address_line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address_line2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
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
      city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PartyAddress",
    tableName: "party_addresses",
    timestamps: true,
    underscored: true,
  }
);

export default PartyAddress;
