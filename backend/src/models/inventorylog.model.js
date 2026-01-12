
// import mongoose from 'mongoose';

// const inventoryLogSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true,
//   },
//   variant: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ['restock', 'sale', 'return', 'adjustment', 'damage', 'transfer'],
//     required: true,
//   },
//   quantity: {
//     type: Number,
//     required: true,
//   },
//   previousStock: {
//     type: Number,
//     required: true,
//   },
//   newStock: {
//     type: Number,
//     required: true,
//   },
//   reason: {
//     type: String,
//     required: true,
//     maxlength: [500, 'Reason cannot exceed 500 characters'],
//   },
//   orderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order',
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   isAutomatic: {
//     type: Boolean,
//     default: false,
//   },
//   metadata: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {},
//   },
// }, {
//   timestamps: true,
// });


// // Indexes for better query performance
// inventoryLogSchema.index({ product: 1 });
// inventoryLogSchema.index({ variant: 1 });
// inventoryLogSchema.index({ type: 1 });
// inventoryLogSchema.index({ createdAt: -1 });
// inventoryLogSchema.index({ orderId: 1 });

// const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

// export default InventoryLog;
