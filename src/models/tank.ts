import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Batch } from './batch';

@Table({ tableName: 'tanks', timestamps: true })
export class Tank extends Model {
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  id!: string;

  @ForeignKey(() => Batch)
  @Column({ type: DataType.STRING, allowNull: false })
  batchId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  capacity!: number;
}
