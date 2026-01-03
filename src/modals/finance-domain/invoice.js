import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class Invoice extends Model {}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
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

    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bills',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    cgst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    sgst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    igst_amount: {
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

    status: {
      type: DataTypes.ENUM('PAID', 'UNPAID', 'OVERDUE'),
      allowNull: false,
      defaultValue: 'UNPAID',
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
  }
);

export default Invoice;
