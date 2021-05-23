import { Message } from "discord.js"
import { client } from '../customDefinitions'
import { getKey } from '../functions/db'
import { inputSnipe } from '../functions/snipe'

export default async function register(client: client, message: Message) {
	if (!(message.channel.type == 'news' || message.channel.type == 'text')) return
	if (message.author.bot) return
	if (message.author.id == process.env.OWNERID) return
	inputSnipe(message, null, 'delete')
	//#region Delete log code
	const logDeletes = await getKey(message.guild.id, 'logDeletedMessages')
	if (logDeletes == 'true') {
		let modLogChannnel = await getKey(message.guild.id, 'modLogChannel')
		if (!modLogChannnel) return
		modLogChannnel = await client.channels.cache.get(modLogChannnel)
		if (!modLogChannnel) return
		let urls = ''
		if (message.attachments) {
			message.attachments.each(attachment => {
				urls += '\n' + attachment.url
			})
		}

		const embed = {
			title: 'Message deleted',
			description: `Message deleted in <#${message.channel.id}> by <@${message.author.id}>:\n\`\`\`${message.content || 'NULL'}\`\`\`Attachments:${urls || 'NONE'}`,
			color: ' #FF0000',
			timestamp: Date.now(),
		}
		modLogChannnel.send({ embed: embed })
	}
	//#endregion
}
