import Room from '../objects/room/Room'
import WaddleRoom from '../objects/room/WaddleRoom'
import PluginManager from '../plugins/PluginManager'


export default class DataHandler {

    constructor(id, users, db, config) {
        this.id = id
        this.users = users
        this.db = db
        this.config = config

        this.usersById = {}
        this.maxUsers = config.worlds[id].maxUsers

        this.init()
    }

    async init() {
        this.crumbs = {
            items: await this.db.getItems(),
            igloos: await this.db.getIgloos(),
            furnitures: await this.db.getFurnitures(),
            floorings: await this.db.getFloorings()
        }

        this.rooms = await this.setRooms()

        await this.setWaddles()

        this.plugins = new PluginManager(this)

        this.updateWorldPopulation()
    }

    async setWaddles() {
        let waddles = await this.db.getWaddles()

        for (let waddle of waddles) {
            this.rooms[waddle.roomId].waddles[waddle.id] = new WaddleRoom(waddle)
        }
    }

    async setRooms() {
        let roomsData = await this.db.getRooms()
        let rooms = {}

        for (let data of roomsData) {
            rooms[data.id] = new Room(data)
        }

        return rooms
    }

    handle(message, user) {
        message.split('\xdd').filter(Boolean).forEach(packet => {
            try {
                let parsed = JSON.parse(packet)
				console.log(parsed)
                console.log(`[DataHandler] Received: ${parsed.action} ${JSON.stringify(parsed.args)}`)

                // Only allow game_auth until user is authenticated
                if (!user.authenticated && parsed.action != 'game_auth') {
                    return user.close()
                }
				
				
				if (parsed.key != 'JrKvJh5xBaQgJad7KXB56ty7uY77rhnVPLHe5M4caj2fDCW3gnTvBePwDcbnrre3fhyaEcRNVYRt3g8wzzbWPAyppa4pUzT5mLHXpSMHEe5NzA3E2JFhkvnhQQMGDLtH4wuLkKtLUXDKadNhpgxsrdpXc9YnzLEvEQpvxcsZtuWHteXP44AHNWxbJTX9g995zEK7PmUUmjEEHJ3WsFPHm5Y82tQDerKQKDrZtCfNxwYV7JBKPNGw55MvYBfrYb7AHxXajK2YGrvw3SamnT2cLQttd3WxE8b6M3MwCFr8a2QvYK5wNAb8WjDGZZWQss92cdBn9ssRqd6evu4thMaF4SV4cmNQAHWEyeCBpEYrEh8VrwUMdgktrLGVkx2CE6MSCkZ3xRZA3wuswhq4Z6LnXxkTXrfF34qcba8pU7DdmVwRzyM8fM8SUQ2WLMBnFHrdsYCPtpCAnGgGSTDL8zEbvbVLJLjeWz3pXaYY7GQPn7jef4s6XEsZPS9SngPSEMSH'){
					return user.close()
				}

                this.fireEvent(parsed.action, parsed.args, user)

            } catch(error) {
                console.error(`[DataHandler] Error: ${error}`)
            }
        })
    }

    fireEvent(event, args, user) {
        this.plugins.getEvent(event, args, user)
    }

    close(user) {
        if (!user) {
            return
        }

        if (user.room) {
            user.room.remove(user)
        }

        if (user.buddy) {
            user.buddy.sendOffline()
        }

        if (user.waddle) {
            user.waddle.remove(user)
        }

        if (user.data && user.data.id && user.data.id in this.usersById) {
            delete this.usersById[user.data.id]
        }

        delete this.users[user.socket.id]

        this.updateWorldPopulation()
    }

    get population() {
        return Object.keys(this.users).length
    }

    async updateWorldPopulation() {
        this.db.worlds.update({ population: this.population }, { where: { id: this.id }})
    }

}
