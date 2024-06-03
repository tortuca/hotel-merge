import { Router, Request, Response, NextFunction } from 'express';
import SupplierService from '../modules/suppliers/suppliers.service';
import HotelService from '../modules/hotels/hotels.service';

const router: Router = Router();
const hotelService: HotelService = new HotelService();
const supplierService: SupplierService = new SupplierService();

router.get('/health', async (req: Request, res: Response) => {
    // res.status(200).json(await testFetch());
    res.status(200).send('OK');
});

router.get('/query', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { destination, hotels } = req.query;
        console.log(`[query] dest=${destination} hotels=${hotels}`);
        const destinationQ = destination ? Number(destination) : -1;
        let hotelsQ: string[] = [];
        if (hotels) {
            if (typeof hotels === 'string') {
                hotelsQ = hotels.indexOf(',') > 0 ? hotels.split(',') : [hotels];
            } else if (Array.isArray(hotels) && hotels.every(item => typeof item === 'string')) {
                hotelsQ = hotels as any;
            } else {
                res.status(400).send('Invalid hotels parameter');
                return;
            }
        }
        // const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';
        res.status(200).json(await hotelService.searchHotels(destinationQ, hotelsQ));
        return res;
    } catch (err) {
        res.status(500).send();
        return next(err);
    }
})

router.post('/suppliers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';
        res.status(200).json(await supplierService.importSupplierData(enableDownload));
    } catch (err) {
        return next(err);
    }
});

export default router;