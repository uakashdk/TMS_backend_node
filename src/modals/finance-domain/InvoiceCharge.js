import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class InvoiceCharge extends Model {}

InvoiceCharge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'invoices', // references Invoice table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    charge_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'other_charger_master', // from other_charge_master
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },

    hsn_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'hsn_master', // references HSN table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    gst_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'gst_master', // references GST table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    base_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    gst_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    gst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    is_taxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'InvoiceCharge',
    tableName: 'invoice_charges',
    timestamps: true,
    underscored: true,
  }
);

export default InvoiceCharge;
