import { Cargo, Tank, Allocation } from '../models';
import { Dinic } from './dinic';

type CargoData = { id: string; volume: number };
type TankData = { id: string; capacity: number };

type AllocationEntry = {
  cargoId: string;
  tankId: string;
  loadedVolume: number;
};

export async function computeRelaxedMaxFlow(cargos: CargoData[], tanks: TankData[]): Promise<number> {
  const source = 0;
  const cargoBase = 1;
  const tankBase = cargoBase + cargos.length;
  const sink = tankBase + tanks.length;

  const dinic = new Dinic(sink + 1);

  cargos.forEach((cargo, i) => {
    dinic.addEdge(source, cargoBase + i, cargo.volume);
  });

  tanks.forEach((tank, j) => {
    dinic.addEdge(tankBase + j, sink, tank.capacity);
  });

  cargos.forEach((cargo, i) => {
    tanks.forEach((tank, j) => {
      dinic.addEdge(cargoBase + i, tankBase + j, tank.capacity);
    });
  });

  return dinic.maxFlow(source, sink);
}

export async function computeRelaxedMaxFlowFromDb(cargos: Cargo[], tanks: Tank[]): Promise<number> {
  return computeRelaxedMaxFlow(
    cargos.map((c) => ({ id: c.id, volume: c.volume })),
    tanks.map((t) => ({ id: t.id, capacity: t.capacity }))
  );
}

export function computeTankAllocation(cargos: CargoData[], tanks: TankData[]): { totalLoaded: number; allocations: AllocationEntry[]; cargoLeftover: { id: string; volume: number }[]; tankUnused: { id: string; capacity: number }[] } {
  const remainingCargo = cargos.map((c) => ({ ...c, remaining: c.volume }));
  const sortedCargos = [...remainingCargo].sort((a, b) => b.remaining - a.remaining);

  const sortedTanks = [...tanks].sort((a, b) => b.capacity - a.capacity);

  const allocations: AllocationEntry[] = [];

  for (const tank of sortedTanks) {
    const available = sortedCargos.filter((c) => c.remaining > 0);
    if (available.length === 0) break;

    // choose best fit cargo for tank: prefer cargo that can fully fill this tank with minimum leftover, else choose largest remaining.
    const bigEnough = available.filter((c) => c.remaining >= tank.capacity);
    let candidate;
    if (bigEnough.length > 0) {
      candidate = bigEnough.reduce((best, current) => (current.remaining < best.remaining ? current : best));
    } else {
      candidate = available.reduce((best, current) => (current.remaining > best.remaining ? current : best));
    }

    const loaded = Math.min(candidate.remaining, tank.capacity);
    if (loaded <= 0) continue;

    allocations.push({ cargoId: candidate.id, tankId: tank.id, loadedVolume: loaded });
    candidate.remaining -= loaded;
  }

  const totalLoaded = allocations.reduce((sum, item) => sum + item.loadedVolume, 0);

  const cargoLeftover = sortedCargos
    .filter((c) => c.remaining > 0)
    .map((c) => ({ id: c.id, volume: c.remaining }));

  const tankAllocated = new Set(allocations.map((item) => item.tankId));
  const tankUnused = sortedTanks.filter((tank) => !tankAllocated.has(tank.id)).map((tank) => ({ id: tank.id, capacity: tank.capacity }));

  return { totalLoaded, allocations, cargoLeftover, tankUnused };
}

export async function runAllocation(batchId: string): Promise<{
  relaxedMaxFlow: number;
  totalLoaded: number;
  allocations: AllocationEntry[];
  cargoLeftover: { id: string; volume: number }[];
  tankUnused: { id: string; capacity: number }[];
}> {
  const cargos = await Cargo.findAll({ where: { batchId } });
  const tanks = await Tank.findAll({ where: { batchId } });

  if (cargos.length === 0 || tanks.length === 0) {
    return { relaxedMaxFlow: 0, totalLoaded: 0, allocations: [], cargoLeftover: [], tankUnused: [] };
  }

  const relaxedMaxFlow = await computeRelaxedMaxFlowFromDb(cargos, tanks);
  const results = computeTankAllocation(
    cargos.map((c) => ({ id: c.id, volume: c.volume })),
    tanks.map((t) => ({ id: t.id, capacity: t.capacity }))
  );

  await Allocation.destroy({ where: { batchId } });
  await Promise.all(
    results.allocations.map((alloc) =>
      Allocation.create({
        batchId,
        cargoId: alloc.cargoId,
        tankId: alloc.tankId,
        loadedVolume: alloc.loadedVolume,
      })
    )
  );

  return { relaxedMaxFlow, ...results };
}

