import got, { RequestError } from "got";
import { randomMobileUA } from '../../utils/ua.js'
import _ from "lodash";
import { shouldCompress } from "./middleware/shouldCompress.js";
import { compress } from "../../services/compress.js";
import { bypass } from "./bypass.js";
import { copyHeaders } from "../../utils/copyHeaders.js";
import redirect from "./redirect.js";
import { CookieJar } from "tough-cookie";

const cookieJar = new CookieJar();
const { pick } = _;

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Request} res 
 */
async function proxy(req, res) {
  try {
    const gotOptions = {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        "user-agent": randomMobileUA(),
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      https: {
        rejectUnauthorized: false,
      },
      maxRedirects: 5,
      decompress: true,
      cookieJar,
      timeout: {
        response: 6600 // ms
      }
    };

    const fetchImg = got.get(req.params.url, { ...gotOptions });

    const request = await fetchImg;
    const buffer = request.rawBody;
    
    console.log("[DOWNLOAD] fetch Image from server " + req.path, request.statusCode >= 400 ? request.rawBody : request.statusCode)

    // clean-up response header genereted by cf
    console.log("[CLEAN] cleaning up cf-headers " + req.path)
    const cfHeaders = [
      'cf-cache-status',
      'cf-ray',
      'cf-request-id',
      'date',
      'server', 'report-to',
      'nel', 'report-policy',
      'cf-polished', 'cf-bgj',
      'age', 'server', 'expires',
      'strict-transport-security',
      'etag', 'expires', 'last-modified',
      'transfer-encoding'
    ]

    cfHeaders.forEach(k=>{
      if(request.headers && request.headers[k]){
        delete request.headers[k]
      }
    })
    
    
    console.log("[CLEANED] cf-headers cleaned " + req.path)

    validateResponse(request)
    copyHeaders(request, res);

    res.setHeader("content-encoding", "identity");
    req.params.originType = request.headers["content-type"] || "";
    req.params.originSize = buffer.length;

    if (shouldCompress(req)) {
      compress(req, res, buffer);
    } else {
      bypass(req, res, buffer);
    }
  } catch (error) {
    if (error instanceof RequestError) {
      console.log(error);
      return res.status(503).end('request time out', 'ascii');
    }
    console.log("some error on " + req.path + "\n", error, '\n');
    return redirect(req, res);
  }
}

const validateResponse = (res) => {
  if (res.statusCode >= 400 || !res.headers['content-type'].startsWith('image')) {
    throw Error(`content-type was ${res.headers['content-type']} expected content type "image/*" , status code ${res.statusCode}`)
  };
}

export default proxy;
