'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('parties', 'party_type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('parties', 'party_type', {
      type: Sequelize.ENUM('client','consignor','consignee','vendor','broker'),
      allowNull: false,
    });
  },
};