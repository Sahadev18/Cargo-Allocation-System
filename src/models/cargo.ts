import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Batch } from './batch';

@Table({ tableName: 'cargos', timestamps: true })
export class Cargo extends Model {
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  id!: string;

  @ForeignKey(() => Batch)
  @Column({ type: DataType.STRING, allowNull: false })
  batchId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  volume!: number;
}
