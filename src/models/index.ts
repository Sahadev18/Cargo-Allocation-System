import { Sequelize } from 'sequelize-typescript';
import { Cargo } from './cargo';
import { Tank } from './tank';
import { Allocation } from './allocation';
import { Batch } from './batch';
const mysql2 = require('mysql2');

const sequelize = new Sequelize({
  dialect: 'mysql',
  dialectModule: mysql2,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cargo_allocation',
  logging: false,
  models: [Cargo, Tank, Allocation, Batch],
});

Batch.hasMany(Cargo, { foreignKey: 'batchId', as: 'cargos' });
Batch.hasMany(Tank, { foreignKey: 'batchId', as: 'tanks' });
Batch.hasMany(Allocation, { foreignKey: 'batchId', as: 'allocations' });
Cargo.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
Tank.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
Allocation.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

Cargo.hasMany(Allocation, { foreignKey: 'cargoId', as: 'allocations' });
Tank.hasMany(Allocation, { foreignKey: 'tankId', as: 'allocations' });
Allocation.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });
Allocation.belongsTo(Tank, { foreignKey: 'tankId', as: 'tank' });

export { sequelize, Cargo, Tank, Allocation, Batch };
