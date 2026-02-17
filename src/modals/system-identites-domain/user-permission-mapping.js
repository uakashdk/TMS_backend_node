import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class UserPermissionMapping extends Model {}

UserPermissionMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    is_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // IMPORTANT
    },
  },
  {
    sequelize,
    modelName: "UserPermissionMapping",
    tableName: "user_permission_mapping",
    timestamps: true, // requires createdAt & updatedAt columns
    indexes: [
      {
        unique: true,
        fields: ["user_id", "permission_id"],
      },
    ],
  }
);

export default UserPermissionMapping;
