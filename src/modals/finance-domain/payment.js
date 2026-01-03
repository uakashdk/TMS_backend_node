import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bill_masters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.ENUM('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD'),
      allowNull: false,
    },

    transaction_reference: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
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
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  }
);

export default Payment;
