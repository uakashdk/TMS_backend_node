'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("job_advance_adjustments", {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      party_advance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "party_advances",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      adjusted_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      adjustment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // INDEXES

    await queryInterface.addIndex(
      "job_advance_adjustments",
      ["company_id"]
    );

    await queryInterface.addIndex(
      "job_advance_adjustments",
      ["job_id"]
    );

    await queryInterface.addIndex(
      "job_advance_adjustments",
      ["party_advance_id"]
    );

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.dropTable("job_advance_adjustments");

  },
};