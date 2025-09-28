// models/Booking.ts
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { DataTypes, Sequelize } from "sequelize";

@Table({
  timestamps: true,
  tableName: "bookings",
  modelName: "Booking",
})
class Booking extends Model {
  // --- Booking Meta ---
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, // custom unique code
  })
  bookingCode!: string;

  // --- Step 1 ---
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone!: string | null;

  // --- Step 2 ---
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bookingType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pickupLocation!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  destination!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tripType!: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  pickupDate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pickupTime!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  returnDate!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  returnTime!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rentalPackage!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passengers!: string;

  // --- Step 3 ---
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  vehicleId!: string; // storing vehicle `id`

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  vehicleName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  vehicleType!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  ac!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  seats!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  baseRate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  extraKmRate!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  features!: object | null;

  // --- 🆕 Fare & Payment Details ---
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  finalTotalFare!: number; // 🆕 Added from frontend payload

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  discountApplied!: number; // 🆕 Added from frontend payload

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  distance!: number | null; // 🆕 Added from frontend payload

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentMethod!: string; // 🆕 Added from frontend payload

  @Column({
    type: DataType.FLOAT,
    defaultValue: 100, // Assuming 100% is default
  })
  paymentPercentage!: number; // 🆕 Added from frontend payload

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amountPaid!: number; // 🆕 Added from frontend payload (Corresponds to frontend 'amountPaid')

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  remainingAmount!: number; // 🆕 Added from frontend payload

  // --- Old Payment Info (Kept for compatibility/total amount reference) ---
  // NOTE: You should rename this field in your DB migration if you want to be
  // explicit, but for now, we map `bookingData.amountPaid` to it, as it seems 
  // to have been used for the paid amount previously.
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number; // This column now holds the 'amountPaid' value

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "INR",
  })
  currency!: string;

  @Column({
    type: DataType.ENUM("pending", "completed", "failed"),
    allowNull: false,
    defaultValue: "pending",
  })
  paymentStatus!: string;

  // --- Timestamps ---
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

  @DeletedAt
  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  deletedAt!: Date;
}

export default Booking;
