import { Supplier } from './suppliers.interface';
import { SupplierModel } from './suppliers.model';

class SupplierRepository {
    public suppliers = SupplierModel;

    public async getAllSupplierData(): Promise<Supplier[]> {
        return await this.suppliers.find(); // Retrieve all suppliers
    }

    public async getDataBySupplier(supplier: string): Promise<Supplier | null> {
        return await SupplierModel.findOne({supplier});
    }

    public async saveDataBySupplier(supplier: string, data: string): Promise<any> {
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
    }

    public async initSupplierDb(): Promise<any> {
        try {
            let collection = await SupplierModel.createCollection();
            console.log('[db]: supplier collection created');
        } catch (error) {
            console.error('[error] unable to create collection:', error);
            throw error;
        }
    }
}

export default SupplierRepository;