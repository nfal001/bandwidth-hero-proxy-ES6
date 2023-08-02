#!/usr/bin/env node
'use strict'
import express from 'express'
import authenticate from './src/authenticate.js'
import { params } from './src/params.js'
import proxy from './src/proxy.js'

const app = express()

const PORT = process.env.PORT || 8080

app.get('*', 'use root endpoint pls')

app.enable('trust proxy')
app.get('/', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
