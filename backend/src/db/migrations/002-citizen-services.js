import { DataTypes } from 'sequelize'

/**
 * Migration 002:
 * Adds missing columns to existing grievances table (if present)
 * and creates new citizen service tables (appointments, invitations).
 */
export async function up({ sequelize, queryInterface }) {
  const table = await queryInterface.describeTable('grievances').catch(() => null)
  if (table) {
    if (!table.inConstituency) {
      await queryInterface.addColumn('grievances', 'inConstituency', {
        type: DataTypes.STRING(32),
        allowNull: true,
        defaultValue: 'yes',
      })
    }
    if (!table.subject) {
      await queryInterface.addColumn('grievances', 'subject', {
        type: DataTypes.STRING(255),
        allowNull: true,
      })
    }
    if (!table.description) {
      await queryInterface.addColumn('grievances', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
      })
    }
  }

  // Create appointments and invitations tables
  await sequelize.sync()
}
