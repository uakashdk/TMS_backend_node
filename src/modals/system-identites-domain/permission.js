import {DataTypes} from 'sequelize';
import {sequelize} from '../../Config/Db.js';
import {Model} from 'sequelize';

class Permission extends Model {}

Permission.init(
  {
    id: {   
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,    
    },
  },
  { 
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: false,
  }
);