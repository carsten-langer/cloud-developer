import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
import { INTEGER } from 'sequelize';
import { Json } from 'sequelize/types/lib/utils';
import Bluebird from 'bluebird';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url);
        }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
    //@TODO try it yourself
    const { id } = req.params;
    const idN: number = parseInt(id)

    if (isNaN(idN)) {
        return res.status(400).send({ message: 'id is malformed' });
    }

    const itemOrNull = await FeedItem.findByPk(idN);
    const item = (itemOrNull === null) ? {} : itemOrNull

    res.status(200).send(item);
});


// update a specific resource
//@TODO try it yourself
// CDL: classic imperative style, step-by-step, uses twice await
router.patch('/foo1/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const { id } = req.params
        const idN: number = parseInt(id)
        if (isNaN(idN))
            return res.status(400).send({ message: 'id is malformed' })

        const itemOrNull = await FeedItem.findByPk(idN)
        if (itemOrNull === null)
            return res.status(400).send({ message: 'id not found' })
        const item = itemOrNull

        const { caption, url } = req.body
        if (caption) item.set("caption", caption)
        if (url) item.url = url // item.set("url", url)
        await item.save()

        res.status(200).send(item)
    })

// CDL: functional style, collects status and message as tuple
// function is not tagged with async and thus does not use await, but returns the Promise it got by findByPk, which also works.
// Here the VS IDE proposes to transform this into an async/await combo, which then looks like above.
// The Bluebird.resolve(...) transform constants into resolved promises to be inline with the findByPk().then() Promise,
// but this is not necessary as then expects a Resolvable, and this could be a Promise or a constant value.
router.patch('/foo2/:id',
    requireAuth,
    (req: Request, res: Response) => {
        const { id } = req.params

        function updateItem(item: FeedItem) {
            const { caption, url } = req.body
            if (caption) item.caption = caption
            if (url) item.url = url
            return item.save()
        }

        const meshOfValuesAndErrors = FeedItem.findByPk(id)
            .then(
                item => (item !== null)
                    ? updateItem(item).then(ui => [200, ui.toJSON()])
                    : Bluebird.resolve([400, { message: "id not found" }]),
                () => Bluebird.resolve([400, { message: "malformed id" }])
            )

        return meshOfValuesAndErrors.then(([status, message]) => res.status(status).send(message))
    })

// CDL: functional style, collects status and message as tuple, only uses 1 await
// still uses the triangle of doom pattern. To avoid this, a better error handling may be needed
// with defined errors and Promise.catch before the .then
router.patch('/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const { id } = req.params

        function updateItem(item: FeedItem) {
            const { caption, url } = req.body
            if (caption) item.caption = caption
            if (url) item.url = url
            return item.save()
        }

        const [status, message] = await FeedItem.findByPk(id)
            .then(
                item => (item !== null)
                    ? updateItem(item).then(ui => [200, ui.toJSON()])
                    : [400, { message: "id not found" }],
                () => [400, { message: "malformed id" }]
            )

        return res.status(status).send(message)
    })


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
    async (req: Request, res: Response) => {
        let { fileName } = req.params;
        const url = AWS.getPutSignedUrl(fileName);
        res.status(201).send({ url: url });
    });

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
        const caption = req.body.caption;
        const fileName = req.body.url;

        // check Caption is valid
        if (!caption) {
            return res.status(400).send({ message: 'Caption is required or malformed' });
        }

        // check Filename is valid
        if (!fileName) {
            return res.status(400).send({ message: 'File url is required' });
        }

        const item = await new FeedItem({
            caption: caption,
            url: fileName
        });

        const saved_item = await item.save();

        saved_item.url = AWS.getGetSignedUrl(saved_item.url);
        res.status(201).send(saved_item);
    });

export const FeedRouter: Router = router;