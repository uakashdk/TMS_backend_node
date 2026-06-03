'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('jobs', 'advance_required_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('jobs', 'advance_received_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });

  },

  async down(queryInterface) {

    await queryInterface.removeColumn(
      'jobs',
      'advance_required_amount'
    );

    await queryInterface.removeColumn(
      'jobs',
      'advance_received_amount'
    );

  },
};