import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    supplier: { type: String, required: true },
    data: { type: String, required: true }
}, { timestamps: true });

export const SupplierModel = mongoose.model('Supplier', SupplierSchema);