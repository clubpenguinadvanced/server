import Plugin from '../Plugin'

import profaneWords from 'profane-words'
import Perspective from 'perspective-api-client'
import { Client, Intents } from 'discord.js'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'send_message': this.sendMessage,
            'send_safe': this.sendSafe,
            'send_emote': this.sendEmote
        }

        this.commands = {
            'ai': this.addItem,
            'users': this.userPopulation
        }

        this.bindCommands()
		
		const token = "ODg3NzY5MTc4NDk5NTkyMjEz.YUI9eg.AGilmsli9YnqoFKmwOswqq3IkKs"
		const dcbot = new Client({ intents: [Intents.FLAGS.GUILDS] });
		this.dcbot = dcbot
		this.dcbot.once('ready', () => {
			console.log('Discord Chat Logging ready!');
		});
		this.dcbot.login(token)
		
		this.perspective = new Perspective({apiKey: "AIzaSyAGrdo9wP9RIwz45wODfgwiTWmMGqmCt5M"});
		
    }
	
	

    // Events

    sendMessage(args, user) {
        // Todo: message validation
        if (args.message.startsWith('!')) {
            return this.processCommand(args.message.substring(1), user)
        }
		
		(async () => {
            const result = await this.perspective.analyze({
			"comment": {text: args.message},
			"languages":["en"],
			"requestedAttributes":{"TOXICITY":{}, "SEXUALLY_EXPLICIT":{}, "PROFANITY":{}}			
			});
			const toxicity = result.attributeScores.TOXICITY.summaryScore.value * 100
			const profanity = result.attributeScores.PROFANITY.summaryScore.value * 100
			const sexual = result.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value * 100
			console.log("**USER:** " + user.data.username + "\n**SENT MESSAGE:** " + args.message + "\n**IN ROOM:** " + user.room.name + "\n**TOXICITY:** " + toxicity.toString().split(".")[0] + "\n**PROFANITY:** " + profanity.toString().split(".")[0] + "\n**SEXUAL:** " + sexual.toString().split(".")[0]);
            if (toxicity > 90 || profanity > 90 || sexual > 90) channel.send("**USER:** " + user.data.username + "\n**SENT MESSAGE:** " + args.message + "\n**IN ROOM:** " + user.room.name + "\n**TOXICITY:** " + toxicity.toString().split(".")[0] + "\n**PROFANITY:** " + profanity.toString().split(".")[0] + "\n**SEXUAL:** " + sexual.toString().split(".")[0]);
        })();
		
		const channel = this.dcbot.channels.cache.get('873544076732026930')
		
		//channel.send("**USER:** " + user.data.username + "\n**SENT MESSAGE:** " + args.message + "\n**IN ROOM:** " + user.room.name)

        if (profaneWords.some((word) => args.message.toLowerCase().indexOf(word) >= 0)) {
            return
        }

        user.room.send(user, 'send_message', { id: user.data.id, message: args.message }, [user], true)
    }

    sendSafe(args, user) {
        user.room.send(user, 'send_safe', { id: user.data.id, safe: args.safe }, [user], true)
    }

    sendEmote(args, user) {
        user.room.send(user, 'send_emote', { id: user.data.id, emote: args.emote }, [user], true)
    }

    // Commands

    bindCommands() {
        for (let command in this.commands) {
            this.commands[command] = this.commands[command].bind(this)
        }
    }

    processCommand(message, user) {
        let args = message.split(' ')
        let command = args.shift()

        if (command in this.commands) {
            return this.commands[command](args, user)
        }
    }

    addItem(args, user) {
        if (user.isModerator) {
            this.plugins.item.addItem({ item: args[0] }, user)
        }
    }

    userPopulation(args, user) {
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
