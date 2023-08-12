import sharp from 'sharp'
import redirect from '../redirect.js'

export const compress = async (req, res, input) => {
  let format = req.params.webp ? 'webp' : 'jpeg';
  const imageProcessing = sharp(input)

  const metadata = await imageProcessing.metadata();

  if (format == 'webp'){
    if (metadata.height > 16383 || metadata.width > 16383 ){
      format = 'jpeg'
    }
  }
  
  imageProcessing.grayscale(req.params.grayscale).toFormat(format,{
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
      effort: 1,
      smartSubsample: true,
      lossless: false,
      mozjpeg: format === 'jpeg' ? true : false
  }).toBuffer((err, output, info) => {
      
    if (err || !info || res.headersSent) return redirect(req, res)

    res.setHeader('content-type', `image/${format}`)
    res.setHeader('content-length', info.size)
    res.setHeader('x-original-size', req.params.originSize)
    res.setHeader('x-bytes-saved', req.params.originSize - info.size)
    res.status(200)
    res.write(output)
    res.end()
  })
}