import { Message } from "discord.js"
import { client } from '../../customDefinitions'
import fetch from 'node-fetch'

export const name = 'fox'
export const description = 'Fox'
export const usage = 'fox'
export const allowInDm = true
export async function execute(client: client, message: Message, args) {
	const { image } = await fetch(
		'https://randomfox.ca/floof/'
	).then((response) => response.json())
	message.channel.send(
		image || "Unable to get a cute fox, the api's probably down :c"
	)
}
