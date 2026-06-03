'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      'rate_contracts',
      'contract_code',
      {
        type: Sequelize.STRING(30),
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'rate_contracts',
      'remarks',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'rate_contracts',
      'status',
      {
        type: Sequelize.ENUM(
          'DRAFT',
          'ACTIVE',
          'EXPIRED',
          'CANCELLED'
        ),
        defaultValue: 'ACTIVE',
      }
    );

  },

  async down(queryInterface) {

    await queryInterface.removeColumn(
      'rate_contracts',
      'contract_code'
    );

    await queryInterface.removeColumn(
      'rate_contracts',
      'remarks'
    );

    await queryInterface.removeColumn(
      'rate_contracts',
      'status'
    );

  },
};