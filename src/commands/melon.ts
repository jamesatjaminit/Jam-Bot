import { Message } from "discord.js"
import { client } from '../customDefinitions'
import { Logger } from "winston"
const image = require('./image')
const random = require('random')

export const name = 'melon'
export const description = 'Watermelon'
export const usage = 'melon'
export function execute(client: client, message: Message, args, logger: Logger) {
	const tempArgs = [random.int(1, 25), 'watermelon'] // eslint-disable-line no-undef
	image.execute(client, message, tempArgs)
}
