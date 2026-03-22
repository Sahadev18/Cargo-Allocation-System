import express from 'express';
import dotenv from 'dotenv';
import { sequelize, Cargo, Tank, Batch } from './models';
import { runAllocation } from './services/allocator';

dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Cargo Allocation System (Node TS + Sequelize + Dinic)' });
});

app.post('/input', async (req, res) => {
  try {
    const { id, cargos, tanks } = req.body;
    if (!id || !Array.isArray(cargos) || !Array.isArray(tanks)) {
      return res.status(400).json({ message: 'id, cargos array, and tanks array are required.' });
    }

    // Validate payload values (no undefined/NaN values)
    const validCargos = cargos.every((cargo: any) =>
      cargo && typeof cargo.id !== 'undefined' && cargo.id !== null && cargo.id !== '' &&
      typeof cargo.volume !== 'undefined' && cargo.volume !== null && !Number.isNaN(Number(cargo.volume)) && Number(cargo.volume) > 0
    );

    const validTanks = tanks.every((tank: any) =>
      tank && typeof tank.id !== 'undefined' && tank.id !== null && tank.id !== '' &&
      typeof tank.capacity !== 'undefined' && tank.capacity !== null && !Number.isNaN(Number(tank.capacity)) && Number(tank.capacity) > 0
    );

    if (!validCargos || !validTanks) {
      return res.status(400).json({ message: 'Invalid cargos or tanks payload (must have valid ids and positive numeric volume/capacity).'});
    }

    await sequelize.transaction(async (tx) => {
      // Ensure batch exists
      await Batch.upsert({ id }, { transaction: tx });

      // Delete existing cargo and tank for this batch
      await Cargo.destroy({ where: { batchId: id }, transaction: tx });
      await Tank.destroy({ where: { batchId: id }, transaction: tx });

      const cargosUpsert = cargos.map((cargo: any) => ({ id: String(cargo.id), batchId: id, volume: Number(cargo.volume) }));
      const tanksUpsert = tanks.map((tank: any) => ({ id: String(tank.id), batchId: id, capacity: Number(tank.capacity) }));

      await Cargo.bulkCreate(cargosUpsert, { transaction: tx });
      await Tank.bulkCreate(tanksUpsert, { transaction: tx });
    });

    return res.status(201).json({ message: 'Input stored successfully for batch.', batchId: id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/optimize', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'id is required.' });
    }

    const output = await runAllocation(id);
    return res.status(200).json({ batchId: id, ...output });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Optimization failed', error: (error as Error).message });
  }
});

app.get('/results', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'id query parameter is required.' });
    }

    const { Allocation } = require('./models');
    const allocations = await Allocation.findAll({
      where: { batchId: id },
      include: [{ model: Cargo, as: 'cargo' }, { model: Tank, as: 'tank' }]
    });
    return res.status(200).json({ batchId: id, allocations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not fetch results.' });
  }
});

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
