const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 8000);
const ROOT_DIR = __dirname;

loadEnvFile(path.join(ROOT_DIR, ".env"));

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
const WINDY_API_KEY = process.env.WINDY_API_KEY || "";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const lines = fileContents.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(payload);
}

function getSafeFilePath(requestPathname) {
  const decodedPath = decodeURIComponent(requestPathname);
  const targetPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const absolutePath = path.normalize(path.join(ROOT_DIR, targetPath));

  if (!absolutePath.startsWith(ROOT_DIR)) {
    return null;
  }

  return absolutePath;
}

async function proxyJson(response, targetUrl) {
  try {
    const upstreamResponse = await fetch(targetUrl);
    const responseBody = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8";

    response.writeHead(upstreamResponse.status, { "Content-Type": contentType });
    response.end(responseBody);
  } catch (error) {
    sendJson(response, 502, {
      error: "Unable to reach weather provider.",
      details: error.message,
    });
  }
}

async function handleApi(requestUrl, response) {
  if (requestUrl.pathname === "/api/config") {
    sendJson(response, 200, {
      windyApiKey: WINDY_API_KEY,
    });
    return;
  }

  if (!OPENWEATHER_API_KEY) {
    sendJson(response, 500, {
      error: "Missing OPENWEATHER_API_KEY in server environment.",
    });
    return;
  }

  if (requestUrl.pathname === "/api/weather") {
    const city = requestUrl.searchParams.get("q");
    if (!city) {
      sendJson(response, 400, { error: "Missing required query parameter: q" });
      return;
    }

    const targetUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${OPENWEATHER_API_KEY}`;
    await proxyJson(response, targetUrl);
    return;
  }

  if (requestUrl.pathname === "/api/onecall") {
    const lat = requestUrl.searchParams.get("lat");
    const lon = requestUrl.searchParams.get("lon");

    if (!lat || !lon) {
      sendJson(response, 400, { error: "Missing required query parameters: lat and lon" });
      return;
    }

    const targetUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&exclude=hourly&appid=${OPENWEATHER_API_KEY}`;
    await proxyJson(response, targetUrl);
    return;
  }

  sendJson(response, 404, { error: "API route not found." });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname.startsWith("/api/")) {
    await handleApi(requestUrl, response);
    return;
  }

  const absolutePath = getSafeFilePath(requestUrl.pathname);
  if (!absolutePath) {
    sendText(response, 400, "Bad request");
    return;
  }

  fs.readFile(absolutePath, (error, fileContents) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendText(response, 404, "Not found");
      } else {
        sendText(response, 500, "Internal server error");
      }
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(fileContents);
  });
});

server.listen(PORT, () => {
  console.log(`Weather dashboard running at http://localhost:${PORT}`);
});
