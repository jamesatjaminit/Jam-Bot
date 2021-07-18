import { Message } from "discord.js"
import { client } from '../../customDefinitions'
import { generateGuildInfoEmbed } from '../../events/guildCreate'

export const name = 'guild'
export const description = 'Gets guild info'
export const usage = ''
export async function execute(client: client, message: Message, args) {
	if (message.author.id == process.env.OWNERID) {
		if (!args[0]) return message.reply('you need to specify a guild id')
		message.channel.send({
			embed: generateGuildInfoEmbed(
				await client.guilds.fetch(args[0])
			),
		})
	}
}
