const LOGIN = process.env.LOGIN
const PASSWORD = process.env.PASSWORD


export default {
    appPort: process.env.APP_PORT || 8080,
    appId: process.env.APP_ID,
    appKey: process.env.APP_KEY,
    compression:{
        minCompressLength: process.env.MIN_COMPRESS_LENGTH || 1024,
        minTransparentCompressLength: process.env.MIN_COMPRESS_LENGTH * 100,
        defaultQuality: process.env.DEFAULT_QUALITY || 60
    },
    isAuthRequired: LOGIN && PASSWORD
}