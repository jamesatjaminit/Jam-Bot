process.chdir(__dirname)
// Mr imports
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
import { Client, ClientOptions, Collection, Intents } from 'discord.js'
import { client } from './customDefinitions'
import { scheduleJob } from 'node-schedule'
import { stopBot } from './functions/util'
// Event Imports
import guildCreate from './events/guildCreate'
import guildDelete from './events/guildDelete'
import messageEvent from './events/message'
import messageUpdate from './events/messageUpdate'
import messageDelete from './events/messageDelete'
import guildMemberAdd from './events/guildMemberAdd'


// Misc Scripts
import sendTwitchNotifications from './cron/twitch'
import { connect, returnRawClient } from './functions/db'

const clientOptions: ClientOptions = {
	disableMentions: 'everyone',
	ws: { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] },
	presence: { status: 'online', activity: { name: process.env.DEFAULTPREFIX + 'help', type: 'WATCHING' } },
	messageEditHistoryMaxSize: 2,
	messageSweepInterval: 300,
	messageCacheLifetime: 150,
	messageCacheMaxSize: 100
}
// @ts-expect-error
const client: client = new Client(clientOptions)

import { createLogger, transports, format } from "winston";


// eslint-disable-next-line no-unexpected-multiline
(async function () {
	// Logging
	client.logger = createLogger({
		level: 'info',
		format: format.json(),
		transports: [
			new transports.File({
				filename: 'error.log',
				level: 'warn',
			}),
			new transports.File({
				filename: 'combined.log',
				level: 'info',
			}),
		],
	})
	if (process.env.SHOW_DEBUG == 'TRUE') {
		client.logger.add(new transports.Console({
			level: 'debug',
			format: format.combine(format.colorize(), format.simple()),
		}));
		client.logger.info('Logger is in DEBUG mode')
	} else if (process.env.NODE_ENV !== 'production') {
		client.logger.add(new transports.Console({
			level: 'verbose',
			format: format.combine(format.colorize(), format.simple()),
		}));
		client.logger.info('Logger is in VERBOSE mode')
	}

	// Registers all the commands in the commands folder
	// https://discordjs.guide/command-handling/dynamic-commands.html#how-it-works
	client.logger.verbose('Registering commands')
	client.commands = new Collection
	const fs = require('fs')
	const commandFiles = fs
		.readdirSync('./commands')
		.filter((file) => file.endsWith('.js'))
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`)
		client.commands.set(command.name, command)
	}

	// Database connections
	client.logger.verbose('Attempting to connect to database...')
	const db = await connect(client.logger)
	if (!db) {
		client.logger.error('DB not found')
		process.exit(1)
	}

	// Events
	client.on('guildCreate', guild => {
		guildCreate(guild)
	})
	client.on('guildDelete', guild => {
		guildDelete(guild)
	})
	client.on('message', msg => {
		messageEvent(client, msg)
	})
	client.on('messageDelete', msg => {
		// @ts-expect-error
		messageDelete(client, msg)
	})
	client.on('messageUpdate', (oldMessage, newMessage) => {
		// @ts-expect-error
		messageUpdate(oldMessage, newMessage)
	})
	client.on('guildMemberAdd', member => {
		guildMemberAdd(member)
	})
	client.on('error', error => {
		client.logger.error(error)
	})
	client.on('invalidated', function () {
		// @ts-expect-error
		process.emit('SIGINT')
	})
	client.on('guildUnavailable', (guild) => {
		client.logger.error(`Guild ${guild.id} has gone unavailable.`)
	})
	client.on('warn', info => {
		client.logger.warn(info)
	})
	client.on('rateLimit', rateLimitInfo => {
		client.logger.error(
			`Rate limit hit. Triggered by ${rateLimitInfo.path}, timeout for ${rateLimitInfo.timeout}. Only ${rateLimitInfo.limit} can be made`
		)
	})

	// SIGINT STUFF
	if (process.platform === 'win32') {
		const rl = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout,
		})
		rl.on('SIGINT', function () {
			// @ts-ignore
			process.emit('SIGINT')
		})
	}
	process.on('SIGINT', function () {
		// Shutdown stuff nicely
		client.logger.debug('SIGINT received, stopping bot')
		stopBot(client, returnRawClient())
	})

	// Initialisation
	client.on('ready', () => {
		const readyDate = new Date().toTimeString()
		client.logger.info('Client is READY at: ' + readyDate)
		if (process.env.twitchApiClientId && process.env.twitchApiSecret) {
			// Only if api tokens are present
			scheduleJob('*/5 * * * * *', function () {
				// Twitch notifications
				sendTwitchNotifications(client)
			})
		}
	})
	await client.login(process.env.TOKEN)
}())
