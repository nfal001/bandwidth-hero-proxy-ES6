import auth from 'basic-auth'
const LOGIN = process.env.LOGIN
const PASSWORD = process.env.PASSWORD
import config from '../../../config/config.js'

const authenticate = (req, res, next) => {
  if (config.isAuthRequired) {
    const credentials = auth(req)
    if (!credentials || credentials.name !== LOGIN || credentials.pass !== PASSWORD) {
      res.setHeader('WWW-Authenticate', `Basic realm="Bandwidth-Hero Compression Service"`)
      
      return res.status(401).end('Access denied')
    }
  }
  
  console.log("[AUTH] GRANTED")
  next()
}

export default authenticate
