
import { onConnection } from "./socketClients.ts"

const server = Deno.listen({ port: 8080 });

console.log('serving http://localhost:8080')

/** handle each incoming connection to this server */
for await (const conn of server) {
    handleConnection(conn);
}

/** handles http connections and listens for requests */
async function handleConnection(conn: Deno.Conn) { 
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
        await requestEvent.respondWith(handleRequest(requestEvent.request));
    }
}

/** handle each new http request */
function handleRequest(request: Request): Promise<Response> {
    if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);
        onConnection(socket, request )
        return Promise.resolve(response);
    }
    return Promise.resolve(new Response(""));
}