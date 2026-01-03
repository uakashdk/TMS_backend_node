import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class TripStatus extends Model {}

TripStatus.init(
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

    status: {
      type: DataTypes.ENUM('CREATED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CREATED',
    },

    status_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'admins', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'TripStatus',
    tableName: 'trip_statuses',
    timestamps: true,
    underscored: true,
  }
);

export default TripStatus;
