/** Baseline: creates every table from the current schema (collections, globals, versions). */
export async function up({ sequelize }) {
  await sequelize.sync()
}
