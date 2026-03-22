import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'batches', timestamps: true })
export class Batch extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING, allowNull: false })
  id!: string;
}