import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class GR extends Model {}

GR.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'trips', // table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    gr_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gr_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'INVOICED', 'CLOSED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'GR',
    tableName: 'grs',
    timestamps: true,
    underscored: true,
  }
);

export default GR;
