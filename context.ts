 
export const DEBUG = (Deno.env.get("DEBUG") === "true") || true
export const Region = Deno.env.get("DENO_REGION") || 'localhost'

export const Context = {
    ID: ""
}

if (DEBUG) console.log(`Deployed from: ${Region}`)

/** collection of content-type strings indexed by an extension string */
const ContentType: Record<string, string> = {
    ".md": "text/markdown",
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".json": "application/json",
    ".map": "application/json",
    ".txt": "text/plain",
    ".ts": "text/typescript",
    ".tsx": "text/tsx",
    ".js": "application/javascript",
    ".jsx": "text/jsx",
    ".gz": "application/gzip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".eot": "appliaction/vnd.ms-fontobject",
    ".ttf": "aplication/font-sfnt",
}

const extention = (fileName: string) => {
    return (fileName) ?
        fileName.substring(fileName.lastIndexOf('.'), fileName.length) || fileName :
        '';
}

/** lookup a type string for a `content-type` header
 * @param {string} path - the filepath used for type lookup
 */
 export const contentType = (path: string): string => {
    const ext = String(extention(path)).toLowerCase()
    return ContentType[ext] || "application/octet-stream"
}
