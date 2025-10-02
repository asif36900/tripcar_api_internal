// models/Payment.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { DataTypes, Sequelize } from "sequelize";
import Booking from "./Booking";

@Table({
  timestamps: true,
  tableName: "payments",
  modelName: "Payment",
})
class Payment extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  transactionId!: string; // unique payment transaction

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  bookingId!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  razorpay_order_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  razorpay_payment_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  razorpay_signature!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "INR",
  })
  currency!: string;

  @Column({
    type: DataType.ENUM("success", "failed", "pending"),
    allowNull: false,
    defaultValue: "pending",
  })
  status!: string;

  @CreatedAt
  @Column({
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  updatedAt!: Date;

}

export default Payment;
