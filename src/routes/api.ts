import { Router, Request, Response, NextFunction } from 'express';
import { getHotels, getSuppliers, testFetch } from '../services/merge';

const router: Router = Router();

router.get('/test', async (req: Request, res: Response) => {
    // res.status(200).json(await testFetch());
    res.status(200).json('test');
});

router.get('/query', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let rooms = await getHotels(false, 0, ['']);
        if (rooms == null || rooms.length == 0) return res.status(200).json({});
        
        console.log(req.query, rooms.length);
        if (req.query.destination) {
            rooms = rooms.filter(room => room['destination'] === Number(req.query.destination));
            console.log('dd', req.query.destination, rooms.length);
        }
        if (req.query.hotels) {
            if (typeof req.query.hotels !== 'string' || typeof req.query.hotels[0] !== 'string') {
                res.status(400).send();
                return;
            }

            let hotelsQ: string[];
            if (typeof req.query.hotels === "string") {
                hotelsQ = [req.query.hotels];
            } else {
                hotelsQ = req.query.hotels;
            }
            rooms = rooms.filter(room => hotelsQ.includes(room['id']));
            console.log('hh', hotelsQ, rooms.length);
        }
        res.status(200).json(rooms);
        return res;
    } catch (err) {
        res.status(500).send();
        return next(err);
    }
})

router.get('/suppliers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getSuppliers();
    } catch (err) {
        return next(err);
    }
});

export default router;