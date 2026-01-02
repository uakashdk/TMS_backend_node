import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../../Config/Db.js';

class Customer extends Model {}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
  },
 user_type: {
  type: DataTypes.ENUM('regular', 'vip', 'corporate'),
  defaultValue: 'regular',
  allowNull: false
},
    status: {
      type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gst_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
},
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
    underscored: true,
  }
);

export default Customer;