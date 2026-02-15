import { DataTypes } from "sequelize";
import {sequelize} from "../../Config/Db.js";

const PaymentSnap = sequelize.define(
  "PaymentSnap",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    // Polymorphic relation
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    entity_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    // Business reference number
    snap_number: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },

    // Financial details
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    flow_direction: {
      type: DataTypes.ENUM("IN", "OUT"),
      allowNull: false,
    },

    payment_mode: {
      type: DataTypes.ENUM("CASH", "UPI", "BANK", "CHEQUE"),
      allowNull: false,
    },

    transaction_ref: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    linked_bill_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    // Verification
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    verified_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Audit
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payment_snaps",
    timestamps: false, // because we are manually handling created_at
    indexes: [
      {
        fields: ["company_id"],
      },
      {
        fields: ["entity_type", "entity_id"],
      },
      {
        fields: ["payment_date"],
      },
      {
        fields: ["flow_direction"],
      },
    ],
  }
);

export default PaymentSnap;
