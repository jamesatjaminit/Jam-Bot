import { Message } from "discord.js"
import { client } from '../../customDefinitions'
import fetch from 'node-fetch'

export const name = 'shorten'
export const description = 'Shortens a URL'
export const usage = 'shorten https://google.com'
export const allowInDm = true
export async function execute(client: client, message: Message, args) {
	if (!args[0])
		return message.reply('you need to specify a url to shorten!')
	const data = await fetch(
		'https://is.gd/create.php?format=json&url=' +
		encodeURIComponent(args[0])
	).then((response) => response.json())
	message.channel.send(
		'<' +
		(data.shorturl ||
			data.errormessage ||
			'Error getting short url.') +
		'>'
	)
}
