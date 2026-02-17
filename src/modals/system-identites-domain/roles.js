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
      unique: true, // super_admin, admin_manager, driver
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
  }
);

export default Role;
