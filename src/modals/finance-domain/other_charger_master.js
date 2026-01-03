import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../Config/Db.js';

class OtherChargeMaster extends Model {}

OtherChargeMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    charge_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // system-level identifier (DETENTION, LOADING, etc.)
    },

    charge_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_taxable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    default_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // some charges may be dynamic
    },

    calculation_type: {
      type: DataTypes.ENUM(
        'FIXED',
        'PERCENTAGE',
        'PER_KM',
        'PER_DAY'
      ),
      allowNull: false,
      defaultValue: 'FIXED',
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'OtherChargeMaster',
    tableName: 'other_charge_master',
    timestamps: true,
    underscored: true,
  }
);

export default OtherChargeMaster;
