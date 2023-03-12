# Bandwidth Hero Data Compression Service

This data compression service is used by
[Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) browser extension. It compresses given
image to low-res [WebP](https://developers.google.com/speed/webp/) or JPEG image. Optionally it also
converts image to greyscale to save even more data.

It downloads original image and transforms it with [Sharp](https://github.com/lovell/sharp) on the
fly without saving images on disk.

This is **NOT** an anonymizing proxy &mdash; it downloads images on user's behalf, passing cookies
and user's IP address through to the origin host.

[//]: <> (## Deployment)
