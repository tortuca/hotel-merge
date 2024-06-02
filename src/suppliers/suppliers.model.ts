import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    supplier: { type: String, required: true },
    data: { type: String, required: true }
}, { timestamps: true });

export const SupplierModel = mongoose.model('Supplier', SupplierSchema);

// actions
export const getAllSupplierData = async () => await SupplierModel.find(); // Retrieve all suppliers
export const getDataBySupplier = async (supplier: string) => await SupplierModel.findOne({supplier});

export const saveDataBySupplier = async (supplier: string, data: string) => {
    try {
        const filter = { supplier };
        const item = { supplier, data };
        const doc = SupplierModel.findOneAndUpdate(filter, item, {
            new: true,
            upsert: true
        });
        return doc;
    } catch (error) {
        console.error('[error] unable to save data:', error);
        throw error;
    }
};

export const initSupplierDb = async () => {
    try {
        let collection = await SupplierModel.createCollection();
        console.log('[db]: supplier collection created');
    } catch (error) {
        console.error('[error] unable to create collection:', error);
        throw error;
    }
};