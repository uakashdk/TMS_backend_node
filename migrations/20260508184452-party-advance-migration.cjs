'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable("party_advances", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  company_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  party_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "parties",
      key: "id",
    },
  },

  job_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "jobs",
      key: "id",
    },
  },

  advance_number: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },

  advance_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },

  advance_type: {
    type: Sequelize.ENUM(
      "JOB_ADVANCE",
      "ON_ACCOUNT"
    ),
    allowNull: false,
    defaultValue: "JOB_ADVANCE",
  },

  amount: {
    type: Sequelize.DECIMAL(12,2),
    allowNull: false,
  },

  adjusted_amount: {
    type: Sequelize.DECIMAL(12,2),
    allowNull: false,
    defaultValue: 0,
  },

  balance_amount: {
    type: Sequelize.DECIMAL(12,2),
    allowNull: false,
  },

  payment_mode: {
    type: Sequelize.ENUM(
      "CASH",
      "BANK",
      "UPI",
      "NEFT",
      "RTGS",
      "CHEQUE"
    ),
    allowNull: false,
  },

  reference_number: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },

  remarks: {
    type: Sequelize.TEXT,
    allowNull: true,
  },

  status: {
    type: Sequelize.ENUM(
      "OPEN",
      "PARTIALLY_ADJUSTED",
      "CLOSED"
    ),
    defaultValue: "OPEN",
  },

  created_by: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  updated_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },

  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },

  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("party_advances");
  }
};
