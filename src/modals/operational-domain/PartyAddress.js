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
      type: DataTypes.STRING, // 🔥 changed from ENUM
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

    city_id: {
      type: DataTypes.INTEGER,
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

    latitude: {
      type: DataTypes.DECIMAL(10, 7), // 🔥 NEW
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7), // 🔥 NEW
      allowNull: true,
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
    modelName: "PartyAddress",
    tableName: "party_addresses",
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

export default PartyAddress;