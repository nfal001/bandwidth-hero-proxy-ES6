import sharp from 'sharp'
import redirect from './redirect.js'

export const compress = (req, res, input) => {
  let format = req.params.webp ? 'webp' : 'jpeg'

  // console.log(`\n format adalah ${format} \n`)
  // console.log(req.params.webp, format, '\n')

  sharp(input).metadata((err,metadata)=>{

    console.log("Buffer metadata - ", `format: ${metadata.format} `,`buffer size: ${metadata.size} `,`width: ${metadata.width}`,`height: ${metadata.height} `)

    if (format == 'webp'){
      if (metadata.height > 16383 || metadata.width > 16383 ){
        
        format = 'jpeg'
        // console.log(`\n ${format} \n`)
        
        // scaler = metadata.height > metadata.width ? { width: 720 } : { width: 16248 }
      }
    }
    sharp(input)
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
      effort: 1,
      smartSubsample: true,
      lossless: false,
      mozjpeg: format === 'jpeg' ? true : false
    })
    .toBuffer((err, output, info) => {
      
      console.log(`\ntrying to compress: status = ${err ?? 'success'}\n`)
      
      if (err || !info || res.headersSent) return redirect(req, res)

      console.log("Processsed Buffer - ", `format: ${info.format} `,`buffer size: ${info.size} `,`width: ${info.width}`,`height: ${info.height} \n`)

      res.setHeader('content-type', `image/${format}`)
      res.setHeader('content-length', info.size)
      res.setHeader('x-original-size', req.params.originSize)
      res.setHeader('x-bytes-saved', req.params.originSize - info.size)
      res.status(200)
      res.write(output)
      res.end()
    })
  })
  
}