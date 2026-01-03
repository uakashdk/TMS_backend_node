import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../Config/Db.js';

class HsnMaster extends Model {}

HsnMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    hsn_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // e.g. 996511
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    gst_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gst_master',
        key: 'id',
      },
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'HsnMaster',
    tableName: 'hsn_master',
    timestamps: true,
    underscored: true,
  }
);

export default HsnMaster;
