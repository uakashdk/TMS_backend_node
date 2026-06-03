'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'jobs',
      'rate_contract_snapshot',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );

  },

  async down(queryInterface) {

    await queryInterface.removeColumn(
      'jobs',
      'rate_contract_snapshot'
    );

  },
};