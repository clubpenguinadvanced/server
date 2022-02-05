import Buddy from './Buddy'
import FurnitureInventory from './FurnitureInventory'
import IglooInventory from './IglooInventory'
import Ignore from './Ignore'
import Inventory from './Inventory'
import PurchaseValidator from './PurchaseValidator'

import CryptoJS from 'crypto-js'


export default class User {

    constructor(socket, handler) {
        this.socket = socket
        this.handler = handler
        this.db = handler.db
        this.crumbs = handler.crumbs

        this.validatePurchase = new PurchaseValidator(this)

        this.data
        this.room
        this.x = 0
        this.y = 0
        this.frame = 1

        this.buddy
        this.ignore
        this.inventory

        this.waddle

        // Game server authentication
        this.authenticated = false
        this.token = {}
    }

    get string() {
        if (this.data.username_approved == 1) {

            return {
                id: this.data.id,
                username: this.data.username,
                color: this.data.color,
                head: this.data.head,
                face: this.data.face,
                neck: this.data.neck,
                body: this.data.body,
                hand: this.data.hand,
                feet: this.data.feet,
                flag: this.data.flag,
                photo: this.data.photo,
                coins: this.data.coins,
                x: this.x,
                y: this.y,
                frame: this.frame,
                rank: this.data.rank,
                joinTime: this.data.joinTime
            }
        } else {
            return {
                id: this.data.id,
                username: "P" + this.data.id.toString(),
                color: this.data.color,
                head: this.data.head,
                face: this.data.face,
                neck: this.data.neck,
                body: this.data.body,
                hand: this.data.hand,
                feet: this.data.feet,
                flag: this.data.flag,
                photo: this.data.photo,
                coins: this.data.coins,
                x: this.x,
                y: this.y,
                frame: this.frame,
                rank: this.data.rank,
                joinTime: this.data.joinTime
            }
        }
    }

get inWaddleGame() {
    return this.waddle && this.room.game && this.waddle.id == this.room.id
}

get isModerator() {
    return this.data.rank > 1
}

async setBuddies(buddies) {
    this.buddy = new Buddy(this)
    await this.buddy.init(buddies)
}

async setIgnores(ignores) {
    this.ignore = new Ignore(this)
    await this.ignore.init(ignores)
}

setInventory(inventory) {
    this.inventory = new Inventory(this, inventory)
}

setIglooInventory(inventory) {
    this.iglooInventory = new IglooInventory(this, inventory)
}

setFurnitureInventory(inventory) {
    this.furnitureInventory = new FurnitureInventory(this, inventory)
}

setItem(slot, item) {
    if (this.data[slot] == item) return

    this.data[slot] = item
    this.room.send(this, 'update_player', {
        id: this.data.id,
        item: item,
        slot: slot
    }, [])

    this.update({
        [slot]: item
    })
}

updateCoins(coins) {
    this.data.coins += coins
    this.update({
        coins: this.data.coins
    })
}

joinRoom(room, x = 0, y = 0) {
    if (!room) {
        return
    }

    if (room.isFull) {
        return this.send('error', {
            error: 'Sorry this room is currently full'
        })
    }

    this.room.remove(this)

    this.room = room
    this.x = x
    this.y = y
    this.frame = 1

    this.room.add(this)
}

update(query) {
    this.db.users.update(query, {
        where: {
            id: this.data.id
        }
    })
}

encryptData(text) {
    const passphrase = 'JrKvJh5xBaQgJad7KXB56ty7uY77rhnVPLHe5M4caj2fDCW3gnTvBePwDcbnrre3fhyaEcRNVYRt3g8wzzbWPAyppa4pUzT5mLHXpSMHEe5NzA3E2JFhkvnhQQMGDLtH4wuLkKtLUXDKadNhpgxsrdpXc9YnzLEvEQpvxcsZtuWHteXP44AHNWxbJTX9g995zEK7PmUUmjEEHJ3WsFPHm5Y82tQDerKQKDrZtCfNxwYV7JBKPNGw55MvYBfrYb7AHxXajK2YGrvw3SamnT2cLQttd3WxE8b6M3MwCFr8a2QvYK5wNAb8WjDGZZWQss92cdBn9ssRqd6evu4thMaF4SV4cmNQAHWEyeCBpEYrEh8VrwUMdgktrLGVkx2CE6MSCkZ3xRZA3wuswhq4Z6LnXxkTXrfF34qcba8pU7DdmVwRzyM8fM8SUQ2WLMBnFHrdsYCPtpCAnGgGSTDL8zEbvbVLJLjeWz3pXaYY7GQPn7jef4s6XEsZPS9SngPSEMSH';
    return CryptoJS.AES.encrypt(text, passphrase).toString();
};

send(action, args = {}) {
    let messagedata = JSON.stringify({
        action: action,
        args: args
    })

    this.socket.emit('message', this.encryptData(messagedata))

    let parsed = JSON.parse(messagedata)
}

close() {
    this.socket.disconnect(true)
}

}