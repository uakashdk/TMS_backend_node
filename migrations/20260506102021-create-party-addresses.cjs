'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('party_addresses', {
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

      address_type: {
        type: Sequelize.ENUM('pickup','delivery','billing','office'),
        allowNull: false,
      },

      address_line1: Sequelize.STRING,
      address_line2: Sequelize.STRING,
      state_id: Sequelize.INTEGER,
      city_id: Sequelize.INTEGER,
      postal_code: Sequelize.STRING,

      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('party_addresses');
  },
};