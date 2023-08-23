#!/usr/bin/env node
'use strict'
import 'dotenv/config'
import helmet from 'helmet'
import crypto from 'crypto'
import express from 'express'
import authenticate from './src/features/image_proxy/middleware/authenticate.js'
import { params } from './src/features/image_proxy/middleware/params.js'
import proxy from './src/features/image_proxy/proxy.js'
import url from 'url'

const app = express()

const PORT = process.env.APP_PORT || 8080
const LISTENTOIP = process.argv.includes('--expose') ? '0.0.0.0' : '127.0.0.1'
const clusterNode = crypto.randomBytes(4).toString('hex');

app.enable('trust proxy')
app.use(helmet())

// http://hostname/r?jpg=0&l=70&bw=0&url=https://server.image/wp-content/img/T/The-Ghostly-Doctor/477/07.jpg
app.get('/r', (req, res) => {
    try {
        const parsedURLfromURL = new URL(req.query.url)
        const cachingPath = `${parsedURLfromURL.hostname}${parsedURLfromURL.pathname}`
        res.redirect(url.format({
            pathname: `/_static/${cachingPath}`,
            query: req.query
        }))
    } catch (e) {
        if (e instanceof TypeError) res.status(404).end('bandwidth hero proxy')
    }
});

app.use((_req, res, next) => {
    res.setHeader('x-node-serial', clusterNode);
    next()
})

app.get('/_static/*', authenticate, params, proxy)

app.get('/favicon.ico', (_req, res) => res.status(204).end())

// deprecated
app.get('/', authenticate, params, proxy)


app.get('*', (_req, res) => res.status(404).end('use root / r path', 'ascii'))

app.listen(PORT, LISTENTOIP, () => console.log(`Listening on http://127.0.0.1:${PORT}`))
