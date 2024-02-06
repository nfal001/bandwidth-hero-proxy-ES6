import _ from 'lodash'
import url from "url";

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Request} res 
 */
const urlRedirector = async (req, res) => {
    try {
        const parsedURLfromURL = new URL(req.query.url)
        
        const cachingPath = `${parsedURLfromURL.hostname}${parsedURLfromURL.pathname}`
        const queryNeeded = { ..._.pick(req.headers, ["cookie", "dnt", "referer"]) }
        
        console.log(`[REDIRECT] NEW REQUEST: ${req.url}`)
        const redirect = url.format({
            pathname: `/_static/${cachingPath}`,
            query: { ...req.query, ...queryNeeded }
        })


        res.redirect(redirect)
    } catch (e) {
        console.log("[ERROR] something went error", e, "\n")
        if (e instanceof TypeError) res.status(404).end('bandwidth hero proxy')
    }
}

export {
    urlRedirector
}