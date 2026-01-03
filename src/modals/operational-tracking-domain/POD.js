import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class POD extends Model {}

POD.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'trips', key: 'id' },
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'customers', key: 'id' },
    },

    delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    receiver_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receiver_contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('PENDING', 'DELIVERED', 'FAILED', 'PARTIAL'),
      allowNull: false,
      defaultValue: 'PENDING',
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'admins', key: 'id' },
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'admins', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'POD',
    tableName: 'pods',
    timestamps: true,
    underscored: true,
  }
);

export default POD;
