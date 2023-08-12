#!/usr/bin/env node
'use strict'
import 'dotenv/config'
import crypto from 'crypto'
import express from 'express'
import authenticate from './src/authenticate.js'
import { params } from './src/params.js'
import proxy from './src/proxy.js'

const app = express()

const PORT = process.env.APP_PORT || 8080
const LISTENTOIP = process.argv.includes('--expose') ? '0.0.0.0' : '127.0.0.1'
const clusterNode = crypto.randomBytes(4).toString('hex');

app.enable('trust proxy')

app.use((_req,res,next) =>{
    res.setHeader('x-node-serial',clusterNode);
    next()
})

app.get('/',authenticate, params, proxy)
app.get('/favicon.ico', (_req, res) => res.status(204).end())

app.get('*', (_req,res)=> res.status(404).end('use root path','ascii'))

app.listen(PORT, LISTENTOIP, () => console.log(`Listening on http://127.0.0.1:${PORT}`))
