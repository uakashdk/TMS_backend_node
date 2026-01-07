import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class RateContact extends Model {}

RateContact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    party_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    contact_type: {
      type: DataTypes.ENUM(
        "rate",
        "billing",
        "operation",
        "accounts",
        "general"
      ),
      allowNull: false,
      defaultValue: "general",
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "RateContact",
    tableName: "rate_contacts",
    timestamps: true,
    underscored: true,
  }
);

export default RateContact;
