import { GuildMember, MessageEmbed } from 'discord.js'
import { BotClient } from '../customDefinitions'
import { postToModlog } from '../functions/mod'
import i18next from 'i18next'

export const name = 'guildMemberAdd'

export async function sendUserToModlog(client: BotClient, member: GuildMember) {
    const embed = new MessageEmbed()
    embed.setAuthor(member.displayName, member.user.displayAvatarURL())
    embed.setTitle(i18next.t('events:guildMemberAdd.USER_JOINED'))
    embed.setDescription(
        i18next.t('events:guildMemberAdd.EMBED_DESCRIPTION', {
            userId: member.id,
            creationDate: member.user.createdTimestamp,
            numberOfUsers: member.guild.memberCount,
        })
    )
    embed.setFooter(i18next.t('events:userLogs.USER_ID', { id: member.id }))
    embed.setTimestamp(Date.now())
    embed.setFooter('#26C485')
    await postToModlog(client, member.guild.id, { embeds: [embed] }, 'joinLeaves')
}

export async function register(client: BotClient, member: GuildMember) {
    if (member.partial) await member.fetch()
    await sendUserToModlog(client, member)
}
