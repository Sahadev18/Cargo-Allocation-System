import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Cargo } from './cargo';
import { Tank } from './tank';
import { Batch } from './batch';

@Table({ tableName: 'allocations', timestamps: true })
export class Allocation extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Batch)
  @Column({ type: DataType.STRING, allowNull: false })
  batchId!: string;

  @ForeignKey(() => Cargo)
  @Column({ type: DataType.STRING, allowNull: false })
  cargoId!: string;

  @ForeignKey(() => Tank)
  @Column({ type: DataType.STRING, allowNull: false })
  tankId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  loadedVolume!: number;
}
