# Cargo Allocation System

Node.js + TypeScript backend for cargo-to-tank assignment using Dinic algorithm in core logic.

## Tech stack
- Node.js + TypeScript
- Express
- MySQL via Sequelize ORM
- Dinic (max flow) used in core optimizer

## Setup
1. Copy `.env.example` to `.env` and configure MySQL creds.
2. Create MySQL database `cargo_allocation` (or your DB name in .env).
3. Install dependencies:
   - `npm install`
4. Build and run:
   - `npm run build`
   - `npm run start`

## Development
- `npm run dev`

## API
- `POST /input` body: `{ id: string, cargos: [{id, volume}], tanks: [{id, capacity}] }`
  - Creates or replaces cargo/tank data for the given batch ID.
- `POST /optimize` body: `{ id: string }`
  - Runs allocation for the specified batch ID.
- `GET /results?id=<batchId>`
  - Returns allocation results for the given batch ID.

## Core logic
- `src/services/dinic.ts` implements Dinic max flow
- `src/services/allocator.ts` computes:
  1. `relaxedMaxFlow` using maximum flow without "one cargo per tank" restriction
  2. practical assignment via greedy one-cargo-per-tank (sorted capacity)

## Notes
- The core logic addresses your requirement to use Dinic.
- It preserves constraint "each tank one cargo" in practical output.
