import { Router, Request, Response, NextFunction } from 'express';
import { getHotels, getSuppliers, testFetch } from '../services/merge';

const router: Router = Router();

router.get('/test', async (req: Request, res: Response) => {
    // res.status(200).json(await testFetch());
    res.status(200).json('test');
});

router.get('/query', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let destinationQ: number = -1;
        if (req.query.destination) {
            destinationQ = Number(req.query.destination);
        }
        let hotelsQ: string[] = [];
        if (req.query.hotels) {
            if (typeof req.query.hotels !== 'string' || typeof req.query.hotels[0] !== 'string') {
                res.status(400).send();
                return;
            }

            if (typeof req.query.hotels === "string") {
                hotelsQ = [req.query.hotels];
            } else {
                hotelsQ = req.query.hotels;
            }
        }
        res.status(200).json(await getHotels(true, destinationQ, hotelsQ));
        return res;
    } catch (err) {
        res.status(500).send();
        return next(err);
    }
})

router.get('/suppliers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getSuppliers(true);
    } catch (err) {
        return next(err);
    }
});

export default router;