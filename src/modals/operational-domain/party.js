import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class Party extends Model {}

Party.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "unique_party_per_company",
    },

    party_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_party_per_company",
    },

    party_type: {
      type: DataTypes.STRING, // 🔥 changed from ENUM
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING, // optional business usage
      allowNull: true,
    },

    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Party",
    tableName: "parties",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["company_id"],
      },
    ],
  }
);

export default Party;