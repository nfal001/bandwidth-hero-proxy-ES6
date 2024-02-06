#!/usr/bin/env node
'use strict'
import 'dotenv/config'
import helmet from 'helmet'
import express from 'express'
import authenticate from './src/features/image_proxy/middleware/authenticate.js'
import { params } from './src/features/image_proxy/middleware/params.js'
import proxy from './src/features/image_proxy/proxy.js'
import _ from 'lodash'
import { urlRedirector } from './src/handler/urlParser.js'
import config from './src/config/config.js'

const app = express()

const PORT = config.appPort
const LISTENTOIP = process.argv.includes('--expose') ? '0.0.0.0' : '127.0.0.1'
const clusterNode = config.appKey

app.enable('trust proxy')
app.use(helmet())

const useNodeId = (_req, res, next) => {
    res.setHeader('x-node-id', clusterNode);
    next()
}

app.use(useNodeId)

// http://hostname/r?jpg=0&l=70&bw=0&url=https://server.image/wp-content/img/T/The-Ghostly-Doctor/477/07.jpg
app.get('/r', urlRedirector);


const redirectorAdapter = (req, _res, next) => {
    const queryNeeded = { ..._.pick(req.query, ["cookie", "dnt", "referer"]) }
    _.forOwn(queryNeeded, (value, key) => req.headers[key] = value)
    next()
}

app.get('/_static/*', authenticate, redirectorAdapter, params, proxy)

app.get('/favicon.ico', (_req, res) => res.status(204).end())

// deprecated
app.get('/', authenticate, params, proxy)


app.get('*', (_req, res) => res.status(404).end('use root / r path', 'ascii'))

app.listen(PORT, LISTENTOIP, () => console.log(`Listening on http://${LISTENTOIP}:${PORT}`))
