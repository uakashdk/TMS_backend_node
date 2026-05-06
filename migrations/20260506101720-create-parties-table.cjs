'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      party_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      party_type: {
        type: Sequelize.ENUM('client','consignor','consignee','vendor','broker'),
        allowNull: false,
      },
      contact_person: Sequelize.STRING,
      email: Sequelize.STRING,
      phone_number: Sequelize.STRING,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('parties');
  },
};