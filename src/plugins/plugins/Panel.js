import Plugin from '../Plugin'


export default class Panel extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'get_unverified_users': this.getUnverifedUsers,
            'verify_user': this.verifyUser,
            'reject_user': this.rejectUser,
        }
    }

    async getUnverifedUsers(args, user) {

        let users = await this.db.getUnverifedUsers()

        if (users) {
            user.send('get_unverified_users', {
                users: users
            })
        }
    }

    async verifyUser(args, user) {

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

        this.db.users.update({
            username_rejected: 1,
			username_approved: 0
        }, {
            where: {
                id: args.id
            }
        })
    }

}