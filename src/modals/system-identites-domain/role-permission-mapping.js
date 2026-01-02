import { DataTypes, Model } from "sequelize";
import sequelize from "../../Config/Db.js";

class RolePermissionMapping extends Model {}

RolePermissionMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RolePermissionMapping",
    tableName: "role_permission_mappings",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["role_id", "permission_id"],
      },
    ],
  }
);

export default RolePermissionMapping;
