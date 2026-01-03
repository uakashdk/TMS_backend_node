import { DataTypes, Model } from 'sequelize';
import { sequelize } from "../../Config/Db.js";

class TripExpense extends Model {}

TripExpense.init(
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

    expense_type: {
      type: DataTypes.STRING, 
      allowNull: false, // FUEL, TOLL, PARKING, FOOD, REPAIR, OTHER
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.STRING,
      allowNull: false, // CASH, UPI, CARD, COMPANY_ACCOUNT
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    receipt_document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    expense_date: {   // ✅ fixed spelling
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    created_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_by_role: {
      type: DataTypes.STRING,
      allowNull: false, // DRIVER, ADMIN, ACCOUNTANT
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'TripExpense',
    tableName: 'trip_expenses',
    timestamps: true,
    underscored: true,
  }
);

export default TripExpense;
