'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('party_gsts', 'billing_type', {
      type: Sequelize.ENUM('IGST', 'CGST_SGST'),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('party_gsts', 'billing_type');
  }
};
