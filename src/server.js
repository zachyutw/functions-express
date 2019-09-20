const cors = require('cors');
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const screenshotSite = async (url) => {
    const browser = await puppeteer.launch({ args: [ '--no-sandbox' ] });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 900,
        deviceScaleFactor: 1
    });
    await page.setJavaScriptEnabled(true);
    await page.goto(url);
    const img = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: true, encoding: 'base64' });
    await browser.close();
    return img;
};

const webPageMetas = async (url) => {
    let _metaObj = {};
    const meta = await axios.get(url).then((res) => {
        const $ = cheerio.load(res.data);
        $('meta').each((i, e) => {
            if ($(e).attr('name')) {
                _metaObj[`${$(e).attr('name')}`] = $(e).attr('content');
            } else if ($(e).attr('property')) {
                _metaObj[`${$(e).attr('property')}`] = $(e).attr('content');
            }
        });
        return _metaObj;
    });
    return meta;
};

const simpleServer = express();
simpleServer.get('*', (request, response) => {
    response.send('Hello from Express on Firebase!');
});

const corsServer = express();
corsServer.use(cors({ origin: true }));
//**screenshot  */
const screenshotRouter = express.Router();
const sceenshotController = (req, res) => {
    let message = req.query.message || req.body.message || 'Hello World!';
    let captualUrl = req.query.url || req.body.url;
    captaulUrl = decodeURIComponent(captualUrl);
    return screenshotSite(captualUrl).then((img) => {
        res.status(200).send({ message, jpegBase64: 'data:image/jpeg;base64,' + img });
    });
};
screenshotRouter.post('/', sceenshotController);
screenshotRouter.get('/', sceenshotController);
corsServer.use('/api/sceenshot', screenshotRouter);
//**screenshot  */

//**Fetch Web Page Info*/
const webPageRouter = express.Router();
const webPageController = (req, res) => {
    let message = req.query.message || req.body.message || 'Hello World!';
    let captualUrl = req.query.url || req.body.url;
    captaulUrl = decodeURIComponent(captualUrl);
    return webPageMetas(captualUrl).then((meta) => {
        res.status(200).send({ message, meta });
    });
};
webPageRouter.post('/', webPageController);
webPageRouter.get('/', webPageController);
corsServer.use('/api/webpage', webPageRouter);
//**Fetch Web Page Info*/
//**Fetch Web Text File*/
const webTextFileRouter = express.Router();
const webTextFileController = (req, res) => {
    let message = req.query.message || req.body.message || 'Hello World!';
    let captualUrl = req.query.url || req.body.url;
    captaulUrl = decodeURIComponent(captualUrl);
    return axios.get(captaulUrl).then((resp) => {
        res.status(200).send({ message, data: resp.data });
    });
};
webTextFileRouter.post('/', webPageController);
webTextFileRouter.get('/', webPageController);
corsServer.use('/api/webtextfile', webTextFileController);
//**Fetch Web Text File*/
corsServer.get('*', (req, res) => {
    res.send('Hello from Express on Firebase with CORS!');
});

const cleanPathServer = express();
cleanPathServer.use(cors({ origin: true }));
cleanPathServer.get('*', (req, res) => {
    res.send("Hello from Express on Firebase with CORS! No trailing '/' required!");
});

module.exports = {
    simpleServer,
    corsServer,
    cleanPathServer
};
