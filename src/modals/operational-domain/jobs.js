import { DataTypes, FLOAT, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

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
     is_party_advance_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // 🔹 NEW: Whether advance is actually received
    is_party_advance_received: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pickup_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dropoff_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rate_contract_id:{
      type:DataTypes.INTEGER,
      allowNull:true,
    },
    rate_type:{
      type:DataTypes.STRING,
      allowNull:false,

    },
    rate_value:{
      type:DataTypes.DOUBLE,
      allowNull:false,
    },
    freight_amount:{
      type:DataTypes.DOUBLE,
      allowNull:false
    },
    freight_basis_value:{
      type:DataTypes.DOUBLE,
      allowNull:true
    },
    commercial_snapshot:{
      type:DataTypes.JSON,
      allowNull:true
    },
    created_by:{
       type:DataTypes.BIGINT,
       allowNull:true,
    },
    updated_by:{
     type:DataTypes.INTEGER,
     allowNull:true,
    },
    jobs_status: {
  type: DataTypes.ENUM(
    'PENDING',
    'TRIP_CREATED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  ),
  allowNull: false,
  defaultValue: 'PENDING',
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
