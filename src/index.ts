process.chdir(__dirname)
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			__rootdir__: string;
		}
	}
}

global.__rootdir__ = __dirname || process.cwd();
// Mr imports
if (!process.env.token) {
	require('dotenv').config();
}

import { Client, ClientOptions, Intents, MessageEmbed, WebhookClient } from 'discord.js'
import { createLogger, transports, format } from "winston";
import { BotClient } from './customDefinitions'
import { scheduleJob } from 'node-schedule'
import { registerCommands, registerEvents, registerSlashCommands } from './functions/registerCommands'
import { saveStatsToDB, connectToSatsCollection } from './cron/stats'
import i18next from 'i18next'
import i18nextBackend from 'i18next-fs-backend'

// Misc Scripts
import sendTwitchNotifications from './cron/twitch'
import { connect, returnRawClient } from './functions/db'
import { saveLogger, stopBot, removeItemFromArray, capitaliseSentence } from './functions/util'
import { processTasks } from './functions/mod'
// eslint-disable-next-line no-unexpected-multiline
(async function () {
	const clientOptions: ClientOptions = {
		allowedMentions: { parse: ['roles', 'everyone'] },
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
		presence: { status: 'online', activities: [{ name: '/help', type: 'WATCHING' }] },
		partials: ['MESSAGE', 'GUILD_MEMBER']
	}
	// @ts-expect-error
	const client: BotClient = new Client(clientOptions)
	// Logging
	const logger = createLogger({
		level: 'info',
		transports: [
			new transports.File({
				filename: 'error.log',
				level: 'warn',
				format: format.combine(
					format.timestamp(),
					format.json()
				),
			}),
			new transports.File({
				filename: 'combined.log',
				level: 'info',
				format: format.combine(
					format.timestamp(),
					format.json()
				),
			}),
		],
	})
	if (String(process.env.showDebugMessages).toUpperCase() == 'TRUE') {
		logger.add(new transports.Console({
			level: 'debug',
			format: format.combine(format.colorize(), format.simple()),
		}));
		logger.info('Logger is in DEBUG mode')
	} else if (process.env.NODE_ENV !== 'production') {
		logger.add(new transports.Console({
			level: 'verbose',
			format: format.combine(format.colorize(), format.simple()),
		}));
		logger.info('Logger is in VERBOSE mode')
	}
	//#region Error reporting
	const loggerBuffer = []
	logger.on('data', async data => {
		try {
			if (String(data.message).includes('DiscordAPIError: Missing Access')) return
			if ((data.level == 'error' || data.level == 'warn') && process.env.errorLogWebhookUrl) {
				const loggerWebhookClient = new WebhookClient({ url: process.env.errorLogWebhookUrl })
				if (loggerBuffer.includes(data.message)) return
				const embed = new MessageEmbed
				embed.setTitle(`Logger`)
				embed.setTimestamp(Date.now())
				if (data.level == 'error') {
					embed.setColor('#ff0000')
				} else {
					embed.setColor('#ffbf00')
				}
				embed.addField(String(data.level).toUpperCase(), data.message)
				loggerBuffer.push(data.message)
				try {
					loggerWebhookClient.send({ username: client.user.username, avatarURL: client.user.avatarURL(), embeds: [embed] })
					// eslint-disable-next-line no-empty
				} catch {

				}
				setTimeout(() => removeItemFromArray(loggerBuffer, data.message), 20 * 1000)
			}
			// eslint-disable-next-line no-empty
		} catch {

		}

	})
	//#endregion
	saveLogger(logger)
	client.logger = logger
	i18next.use(i18nextBackend).init({
		lng: 'en',
		ns: ['general', 'commands', 'events', 'misc'],
		defaultNS: 'commands',
		backend: {
			loadPath: '../locales/{{lng}}/{{ns}}.json'
		},
		interpolation: {
			escapeValue: false,
			format: function (value, format, lng) {
				if (format === 'capitalise') return capitaliseSentence(value)
			}
		}
	})
	// Registers all the commands in the commands folder
	// https://discordjs.guide/command-handling/dynamic-commands.html#how-it-works
	logger.verbose('Registering commands...')
	registerCommands(client)
	logger.verbose('Registering events...')
	registerEvents(client)
	// Database connections
	logger.verbose('Attempting to connect to database...')
	const db = await connect(logger)
	if (!db) {
		logger.error('DB not found')
		await stopBot(client, null, 1)
	} else {
		logger.verbose("Successfully connected to database")
	}
	connectToSatsCollection(returnRawClient())
	// Events
	client.on('guildCreate', guild => {
		client.events.get('guildCreate').register(guild)
	})
	client.on('guildDelete', guild => {
		client.events.get('guildDelete').register(guild)
	})
	client.on('messageCreate', message => {
		client.events.get('messageCreate').register(client, message)
	})
	client.on('messageDelete', message => {
		client.events.get('messageDelete').register(client, message)
	})
	client.on('messageUpdate', (oldMessage, newMessage) => {
		client.events.get('messageUpdate').register(client, oldMessage, newMessage)
	})
	client.on('error', error => {
		logger.error('Error logged: ' + error)
	})
	client.on('invalidated', function () {
		logger.error('Client invalidated, quitting...')
		stopBot(client, returnRawClient(), 1)
	})
	client.on('guildUnavailable', (guild) => {
		logger.warn(`Guild ${guild.id} has gone offline.`)
	})
	client.on('warn', info => {
		logger.warn(info)
	})
	client.on('rateLimit', rateLimitInfo => {
		logger.warn(
			`Rate limit hit. Triggered by ${rateLimitInfo.path}, timeout for ${rateLimitInfo.timeout}. Only ${rateLimitInfo.limit} can be made`
		)
	})
	client.on('interactionCreate', interaction => {
		client.events.get('interactionCreate').register(client, interaction)
	})
	client.on('guildMemberAdd', member => {
		client.events.get('guildMemberAdd').register(client, member)
	})
	client.on('guildMemberRemove', member => {
		client.events.get('guildMemberRemove').register(client, member)
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
		logger.debug('SIGINT received, stopping bot')
		stopBot(client, returnRawClient())
	})

	if (process.env.NODE_ENV == 'production') {
		process.on('uncaughtException', (error, source) => {
			logger.error('Unhandled exception caught: ' + error + '\n' + source)
		});
	}
	// Initialisation
	client.on('ready', async () => {
		logger.info('Client is READY')
		await registerSlashCommands(client)
		if (process.env.twitchApiClientId && process.env.twitchApiSecret) {
			// Only if api tokens are present
			scheduleJob('*/5 * * * * *', function () {
				// Twitch notifications
				sendTwitchNotifications(client)
			})
		}
		scheduleJob('0 * * * *', function () {
			saveStatsToDB()
		})
		scheduleJob('*/30 * * * * *', function () {
			processTasks(client)
		})
	})
	await client.login(process.env.token)
}())
