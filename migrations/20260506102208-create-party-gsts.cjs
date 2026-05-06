'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('party_gsts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      company_id: { type: Sequelize.INTEGER, allowNull: false },

      party_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parties',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      gst_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      state_id: Sequelize.INTEGER,

      gst_registration_type: {
        type: Sequelize.ENUM('regular','composition','unregistered'),
        defaultValue: 'regular',
      },

      gst_nature: {
        type: Sequelize.ENUM('fcm','rcm'),
        allowNull: false,
      },

      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('party_gsts');
  },
};