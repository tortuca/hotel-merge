import cron from 'node-cron';
import dotenv from 'dotenv';

import SupplierService from '../suppliers/suppliers.service';

dotenv.config();

const CRON_ONE_MINUTE = '*/1 * * * *';
const CRON_FIVE_MINUTES = '*/5 * * * *';
const CRON_ONE_HOUR = '* 1 * * *';

const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';
const supplierService = new SupplierService();

export const job = cron.schedule(CRON_FIVE_MINUTES, async () => {
    console.log('[cron] schedule every 5 minutes');
    await supplierService.importSupplierData(enableDownload);
});

export const triggerDownload = async () => {
    console.log('[cron] trigger download');
    await supplierService.importSupplierData(enableDownload);
}

export default job;