import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../Config/Db.js";

class TripAdvance extends Model {}

TripAdvance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // one advance per trip
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.STRING(30),
      allowNull: false, // CASH, UPI, BANK, CARD
    },

    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    given_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    given_by_role: {
      type: DataTypes.STRING(30),
      allowNull: false, // ACCOUNTANT, ADMIN
    },

    given_at: {
      type: DataTypes.DATE,
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
    modelName: "TripAdvance",
    tableName: "trip_advances",
    timestamps: true,
    underscored: true,
  }
);

export default TripAdvance;
