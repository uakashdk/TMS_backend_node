import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class Role extends Model {}

Role.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.STRING,
      defaultValue: "Y",
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",

    timestamps: true,

    // 🔥 CRITICAL LINE
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Role;
