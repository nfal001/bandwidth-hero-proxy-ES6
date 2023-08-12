import got from "got";
import _ from "lodash";
import { shouldCompress } from "./shouldCompress.js";
import { compress } from "./compress.js";
import { bypass } from "./bypass.js";
import { copyHeaders } from "./copyHeaders.js";
import redirect from "./redirect.js";
import { CookieJar } from "tough-cookie";

const cookieJar = new CookieJar();
const { pick } = _;

async function proxy(req, res) {
  try {
    const gotOptions = {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      https: {
        rejectUnauthorized: false,
      },
      maxRedirects: 5,
      decompress: true,
      cookieJar,
    };
    console.log('\n', gotOptions.headers,'\n')
    const request = await got.get(req.params.url, gotOptions);
    
    const buffer = request.rawBody;    
    
    if (request.statusCode >= 400 || !request.headers['content-type'].startsWith('image')) {
      throw Error(`content-type was ${request.headers['content-type']} expected content type "image/*" , status code ${request.statusCode}`)
    };
    
    console.log("\nfetch data: ", request.statusCode, request.statusMessage, '\n');

    copyHeaders(request, res);
    res.setHeader("content-encoding", "identity");
    req.params.originType = request.headers["content-type"] || "";
    req.params.originSize = buffer.length;

    console.log(shouldCompress(req), "begin compress! \n");

    if (shouldCompress(req)) {
      compress(req, res, buffer);
    } else {
      bypass(req, res, buffer);
    }
  } catch (error) {
    console.log("some error", error, '\n');
    return redirect(req, res);
  }
}

export default proxy;
