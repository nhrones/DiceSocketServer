
import { DEBUG, Region, Context } from './context.ts'

import { Players } from "./players.ts"

type Client = {
    id: string
    name: string
    isAlive: boolean
    socket: WebSocket
}
const OPEN = 1;

/** connected socket clients mapped by unique id */
const webSockets = new Map<string, Client>();

export const getCount = () => webSockets.size

const gamePlayers = new Players()

const players = gamePlayers.players

/** the index of the current active player */
let currentPlayerIndex = gamePlayers.currentPlayerIndex

/**  callback for the WebSocket Server 'connect' event. */
export function onConnection(socket: WebSocket, request: Request) {
    if (DEBUG) console.log(`connection in Region ${Region}`)
    const channel = new BroadcastChannel("game");

    const client: Client = {
        id: '',
        name: '',
        isAlive: true,
        socket: socket
    }

    socket.onopen = () => {
        
        // message from another socket! relay it
        channel.onmessage = (e: MessageEvent) => {
            if(socket.readyState === OPEN) {
                socket.send(e.data);
            } 
        }
        
        client.id = request.headers.get('sec-websocket-key') || 'id'
        if (webSockets.size === 0) Context.ID = client.id
        // Register a new client connection
        webSockets.set(client.id, client)
        // tell the instance about its new client-ID
        if (socket.readyState === OPEN) {
            const msg = JSON.stringify({ topic: "SetID", data: { id: client.id } })
            socket.send(msg);
        }
    }

    socket.onclose = () => {
        if (DEBUG) console.log(`socket-client number ${client.id} named ${client.name} has disconnected`)
        channel.postMessage(JSON.stringify({ topic: "ResetGame", data: `socket-client number ${client.id} has disconnected` }))
        webSockets.delete(client.id);
        gamePlayers.removePlayer(client.id)
    }

    socket.onmessage = (event) => {
        let msg
        try {
            msg = JSON.parse(event.data);
        } catch (e) {
            console.info(event)
            console.error('parsed event error: ', e + " msg being parsed was: " + msg)
        }
        if (DEBUG) console.log(JSON.stringify({ topic: msg.topic, data: msg.data }))
        switch (msg.topic) {
            case "RegisterPlayer":
                client.name = gamePlayers.addPlayer(msg.data.id, msg.data.name)
                break
            case "SetPlayerName":
                gamePlayers.setPlayerName(msg.data.id, msg.data.playerName)
                client.name = msg.data.playerName
                break
            case "ResetTurn":
                currentPlayerIndex += 1
                if (currentPlayerIndex >= players.size) {
                    currentPlayerIndex = 0
                }
                msg.data.currentPlayerIndex = currentPlayerIndex
                socket.send(JSON.stringify({ topic: msg.topic, data: msg.data }))
                channel.postMessage(JSON.stringify({ topic: msg.topic, data: msg.data }))
                break
            case "ResetGame":
                //TODO add the 'Players' array to this msg payload
                currentPlayerIndex = 0
                channel.postMessage(JSON.stringify({ topic: msg.topic, data: msg.data }))
                socket.send(JSON.stringify({ topic: msg.topic, data: msg.data }))
                break
            default: // Server is not interested ... just broadcast whatever it is
                channel.postMessage(JSON.stringify({ topic: msg.topic, data: msg.data }))
                break
        }
    }
}

/** broadcasts a message to every registered socket */
export function broadcastAll(topic: string, data: unknown): void {
    if (DEBUG) console.log('broadcastAll: topic:'+ topic + ' data: ' + data) 
    const msg = JSON.stringify({ topic: topic, data: data })
     for (const client of webSockets.values()) {
         if(client.socket.readyState === OPEN){
            client.socket.send(msg)
         }
     }
} 
