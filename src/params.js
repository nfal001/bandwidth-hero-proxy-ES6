const DEFAULT_QUALITY = 40

export function params(req, res, next) {
  let url = req.query.url
  if (Array.isArray(url)) url = url.join('&url=')
  if (!url) return res.end('bandwidth-hero-proxy')

  // console.log('\n')
  // console.log(req.query)
  // console.log('\n')

  url = url.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://')
  req.params.url = url
  req.params.webp = !parseInt(req.query.jpg) ?? !req.query.jpeg
  req.params.grayscale = req.query.bw != 0
  req.params.quality = parseInt(req.query.l, 10) || DEFAULT_QUALITY
  
  // console.log('\n hei',req.params.webp,'\n')

  next()
}
