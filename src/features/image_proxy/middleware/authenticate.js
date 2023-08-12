import auth from 'basic-auth'
const LOGIN = process.env.LOGIN
const PASSWORD = process.env.PASSWORD

const authenticate = (req, res, next) => {
  if (LOGIN && PASSWORD) {
    const credentials = auth(req)
    if (!credentials || credentials.name !== LOGIN || credentials.pass !== PASSWORD) {
      res.setHeader('WWW-Authenticate', `Basic realm="Bandwidth-Hero Compression Service"`)

      return res.status(401).end('Access denied')
    }
  }

  next()
}

export default authenticate
