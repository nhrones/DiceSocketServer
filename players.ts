
import {DEBUG} from './context.ts'

import { broadcastAll } from './socketClients.ts'
 
/** Dice Game Players class */
export class Players {

    players: Map<string, Player>;
    currentPlayerIndex: number

    /** constructor for Players */
    constructor() {
        /** the index of the current active player */
        this.currentPlayerIndex = 0
        /** an array of player 'state' objects */
        this.players = new Map();
    }

    /** add a new player to the players array,  
     * broadcasts RegisterPlayer (will ResetGame) 
     * @param {string} id - the id of the new player
     */
    addPlayer(id: string, playerName: string) {
        //const name = (playerName) ? playerName: playerNames[this.players.size]
        this.players.set(id,
            {
                id: id,
                idx: this.players.size,
                playerName: playerName,
                color: playerColors[this.players.size],
            },
        )
        if (DEBUG) console.info(' added player', Array.from(this.players.values()))
        broadcastAll(
            "UpdatePlayers",
            Array.from(this.players.values()),
        )
        return playerName
    }

    /** removes a Player    
     * called when the players webSocket has closed    
     * @param {string} id - the id of the player to be removed
     */
    removePlayer(id: string) {
        this.players.delete(id)
        this.refreshPlayerColors();
        broadcastAll(
            "UpdatePlayers",
            Array.from(this.players.values()),
        )
    }

    /** sets a Players name,  re-broadcasts 'SetPlayerName' 
     * @param {string} id - the id of the player
     * @param {string} newName - the new name for this player
     * 
     */
    setPlayerName(id: string, newName: string) {
        const player = this.players.get(id)
        if (player) player.playerName = newName;
        broadcastAll(
            "SetPlayerName",
            { id: id, playerName: newName },
        )
    }

    /** reassigns unique color for each active player */
    refreshPlayerColors() {
        let i = 0
        this.players.forEach( player => {
            player.idx = i;
            player.color = playerColors[i]
            i++
        })
    }
}

export type Player = {
    id: string
    idx: number
    playerName: string
    color: string
}

/** an array of player name */
//todo const playerNames = ["Nick", "Sue", "Carter", "Marie"]

/** an array of player colors */
const playerColors = ["Brown", "Green", "RoyalBlue", "Red"]
