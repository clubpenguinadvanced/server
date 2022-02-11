import Plugin from '../Plugin'


export default class Panel extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'get_unverified_users': this.getUnverifedUsers,
            'verify_user': this.verifyUser,
            'reject_user': this.rejectUser,
			'get_user_info': this.getUserInfo,
			'edit_player': this.editPlayer,
			'add_user_coins': this.addUserCoins,
			'add_user_items': this.addUserItems,
			'ban_user': this.banUser,
			'change_user_name': this.changeUsername
        }
    }

    async getUnverifedUsers(args, user) {
		
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}

        let users = await this.db.getUnverifedUsers()

        if (users) {
            user.send('get_unverified_users', {
                users: users
            })
        }
    }

    async verifyUser(args, user) {
		
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}

        this.db.users.update({
            username_approved: 1,
			username_rejected: 0
        }, {
            where: {
                id: args.id
            }
        })
    }
	
	async rejectUser(args, user) {
		
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}

        this.db.users.update({
            username_rejected: 1,
			username_approved: 0
        }, {
            where: {
                id: args.id
            }
        })
    }
	
	async getUserInfo(args, user) {
		
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		let users = await this.db.searchForUsers(args.username)
		
		if (users) {
            user.send('get_unverified_users', {
                users: users
            })
        }
		
	}
	
	async editPlayer(args, user) {
		
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		let request = await this.db.getUserById(args.id)
		
		if (request) {
            user.send('edit_player', {
                user: request
            })
        }
	}
	
	async addUserCoins(args, user) {
	
		if (user.data.rank < 4){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		this.db.addCoins(args.id, args.coins)
		
	}
	
	async addUserItems(args, user) {
	
		if (user.data.rank < 4){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		this.db.addItem(args.id, args.item)
		
	}
		
	async banUser(args, user) {
	
		if (user.data.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		this.db.ban(args.id, args.banDuration, user.data.id)
		
	}
	
	async changeUsername(args, user) {
	
		if (user.rank < 2){
			user.send('error', { error: 'You do not have permission to perform this action.' })
		}
		
		this.db.changeUsername(args.id, args.newUsername)
		
	}

}