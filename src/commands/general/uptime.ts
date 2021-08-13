import { CommandInteraction, Message } from "discord.js"
import { BotClient } from '../../customDefinitions'
import { SlashCommandBuilder } from '@discordjs/builders'
import dayjs from "dayjs"

export const name = 'uptime'
export const description = "Displays the bot's current uptime"
export const usage = 'uptime'
export const allowInDm = true
export const slashData = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
export function execute(client: BotClient, message: Message, args) {
	const TimeDate = dayjs().format("hh:mm:ss a [-] YY:MM:DD")
	message.channel.send(
		'The bot has been up since: ' + TimeDate
	)
}
export async function executeSlash(client: BotClient, interaction: CommandInteraction) {
	const TimeDate = dayjs().format("hh:mm:ss a [-] YY:MM:DD")
	interaction.reply('The bot has been up since: ' + TimeDate)
}
