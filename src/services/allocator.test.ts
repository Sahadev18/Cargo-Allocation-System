import { computeRelaxedMaxFlow, computeTankAllocation } from './allocator';

describe('allocator algorithm', () => {
  test('computeRelaxedMaxFlow returns full possible capacity', async () => {
    const cargos = [
      { id: 'C1', volume: 120 },
      { id: 'C2', volume: 100 },
    ];
    const tanks = [
      { id: 'T1', capacity: 100 },
      { id: 'T2', capacity: 70 },
      { id: 'T3', capacity: 50 },
    ];

    const maxFlow = await computeRelaxedMaxFlow(cargos, tanks);
    expect(maxFlow).toBe(220);
  });

  test('computeTankAllocation uses no mixed cargo in a tank and splits cargo over tanks', () => {
    const cargos = [
      { id: 'C1', volume: 120 },
      { id: 'C2', volume: 100 },
    ];
    const tanks = [
      { id: 'T1', capacity: 100 },
      { id: 'T2', capacity: 70 },
      { id: 'T3', capacity: 50 },
    ];

    const result = computeTankAllocation(cargos, tanks);

    expect(result.totalLoaded).toBe(220);

    const t1 = result.allocations.find((a) => a.tankId === 'T1');
    const t2 = result.allocations.find((a) => a.tankId === 'T2');
    const t3 = result.allocations.find((a) => a.tankId === 'T3');

    expect(t1).toBeDefined();
    expect(t1?.cargoId).toBe('C2');
    expect(t1?.loadedVolume).toBe(100);

    expect(t2).toBeDefined();
    expect(t2?.cargoId).toBe('C1');
    expect(t2?.loadedVolume).toBe(70);

    expect(t3).toBeDefined();
    expect(t3?.cargoId).toBe('C1');
    expect(t3?.loadedVolume).toBe(50);

    expect(result.cargoLeftover).toEqual([]);
    expect(result.tankUnused).toEqual([]);
  });
});
