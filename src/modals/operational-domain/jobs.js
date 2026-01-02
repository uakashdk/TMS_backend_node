import { DataTypes, Model } from 'sequelize';
import sequelize from '../../Config/Db.js';

class Job extends Model {}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,    
    },
    job_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    goods_type: {
      type: DataTypes.STRING,
      allowNull: false,   
    },
    goods_quantity: {
      type: DataTypes.FLOAT, // optional change
      allowNull: false,
    },
    quantity_units: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dropoff_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: true,
    underscored: true,
  }
);

export default Job;
