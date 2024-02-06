import sharp from 'sharp'
import redirect from '../features/image_proxy/redirect.js'

const worker = sharp
worker.concurrency(1)
worker.cache({memory: 256, items:2, files: 20})

export const compress = async (req, res, input) => {
  let format = req.params.webp ? 'webp' : 'jpeg';
  const imageProcessing = worker(input)

  const metadata = await imageProcessing.metadata();

  if (format == 'webp'){
    // maximum webp size was 16383 x 16383. using jpeg if more than 16383
    if (metadata.height > 16383 || metadata.width > 16383 ){
      format = 'jpeg'
    }
  }
  console.log("QUEUE:: ", worker.counters())
  console.log(`[COMPRESS] BEGIN: compressing file ${req.path}`)
  imageProcessing.grayscale(req.params.grayscale).toFormat(format,{
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
      effort: 1,
      smartSubsample: true,
      lossless: false,
      mozjpeg: format === 'jpeg' ? true : false
  }).toBuffer(async (err, output, info) => {
      
    if (err || !info || res.headersSent) return redirect(req, res)
    console.log(`[COMPRESS] OK: compressed file sent ${req.path}`)
    res.setHeader('content-type', `image/${format}`)
    res.setHeader('content-length', info.size)
    res.setHeader('x-original-size', req.params.originSize)
    res.setHeader('x-bytes-saved', req.params.originSize - info.size)
    res.status(200)
    res.write(output)
    res.end()
  })
}
