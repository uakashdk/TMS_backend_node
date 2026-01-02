import {DataTypes,Model} from 'sequelize';
import sequelize from '../../Config/Db.js';

class TripDriverMapping extends Model {}

TripDriverMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    assigned_at:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },    
  },
  {
    sequelize,
    modelName: 'TripDriverMapping',
    tableName: 'trip_driver_mappings',
    timestamps: true,
    underscored: true,
  }
);

export default TripDriverMapping;