import { CommandInteraction, Message } from "discord.js"
import { BotClient } from '../../customDefinitions'
import { request } from 'undici'
import { SlashCommandBuilder } from '@discordjs/builders'

export const name = 'cat'
export const description = 'Purrrr'
export const usage = 'cat'
export const allowInDm = true
export const slashData = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
async function returnCatImage() {
	const response = await request(
		'https://aws.random.cat/meow'
	)
	if (response.statusCode != 200) return 'The API seems to be returning errors, please try again later'
	return (await response.body.json()).file || "Unable to get a kitty cat, the api's probably down"
}
export async function execute(client: BotClient, message: Message, args) {
	message.channel.send(await returnCatImage())
}
export async function executeSlash(client: BotClient, interaction: CommandInteraction) {
	await interaction.deferReply()
	interaction.editReply(await returnCatImage())
}