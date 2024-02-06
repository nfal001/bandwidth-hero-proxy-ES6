import got from "got";
import { randomMobileUA } from '../static/ua.js'
import _ from "lodash";
import { shouldCompress } from "./shouldCompress.js";
import { compress } from "./features/imageProxy/services/compress.js";
import { bypass } from "./bypass.js";
import { copyHeaders } from "./copyHeaders.js";
import redirect from "./features/imageProxy/redirect.js";

const cookieJar = new CookieJar();
const { pick } = _;

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
    };

    const fetchImg = got.get(req.params.url, {...gotOptions});

    const request = await fetchImg;

    const buffer = request.rawBody;    

    validateResponse(request)

    copyHeaders(request, res);

    res.setHeader("content-encoding", "identity");
    req.params.originType = request.headers["content-type"] || "";
    req.params.originSize = buffer.length;

    // console.log(shouldCompress(req), "begin compress! \n");

    const compressImg = 
  } catch (error) {
    console.log("some error", error, '\n');
    return redirect(req, res);
  }
}

const compressImage = (req,res, buffer) => {
  if (shouldCompress(req)) {
    return compress(req, res, buffer);
  }
  return bypass(req, res, buffer);
}

const validateResponse = (res) => {
  if (res.statusCode >= 400 || !res.headers['content-type'].startsWith('image')) {
    throw Error(`content-type was ${res.headers['content-type']} expected content type "image/*" , status code ${res.statusCode}`)
  };
} 

export default proxy;
