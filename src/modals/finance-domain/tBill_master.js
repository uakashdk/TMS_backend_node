import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Bill extends Model {}

Bill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    bill_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    bill_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    gr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'grs', // table name of GR
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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

    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'PAID'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'Bill',
    tableName: 'bills',
    timestamps: true,
    underscored: true,
  }
);

export default Bill;
