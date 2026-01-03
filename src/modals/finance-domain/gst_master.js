import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../Config/Db.js';

class GstMaster extends Model {}

GstMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    gst_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // GST_0, GST_5, GST_12, GST_18
    },

    cgst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    sgst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    igst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    effective_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    effective_to: {
      type: DataTypes.DATE,
      allowNull: true, // NULL = currently active
    },
  },
  {
    sequelize,
    modelName: 'GstMaster',
    tableName: 'gst_master',
    timestamps: true,
    underscored: true,
  }
);

export default GstMaster;
