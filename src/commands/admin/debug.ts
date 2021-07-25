import { Message, MessageEmbed } from "discord.js"
import { client } from '../../customDefinitions'

export const name = 'debug'
export const description = 'Displays debug information'
export const permissions = ['ADMINISTRATOR']
export const usage = 'debug'
export async function execute(client: client, message: Message, args) {
	const sentMessage = await message.channel.send('Loading...')
	const uptimeDate = new Date(Date.now() - client.uptime)
	const embed = new MessageEmbed
	embed.setTitle('Debug Information')
	embed.addField('Roundtrip', `${sentMessage.createdTimestamp - message.createdTimestamp}ms`, true)
	embed.addField('API Latency', `${client.ws.ping}ms`, true)
	embed.addField('Uptime', uptimeDate.toString(), true)
	embed.addField('Guild', message.guild.id, true)
	embed.addField('Revision', process.env.GIT_REV, true)
	embed.setFooter(`Initiated by ${message.author.tag}`, message.author.displayAvatarURL())
	embed.setTimestamp(Date.now())
	embed.setColor('#222E50')
	sentMessage.edit({ content: null, embed: embed })
}
