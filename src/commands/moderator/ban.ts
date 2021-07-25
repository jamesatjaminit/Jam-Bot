import { Message } from "discord.js"
import KickOrBan from '../../functions/kickorban'
import { client } from '../../customDefinitions'

export const name = 'ban'
export const description = 'Bans a user from the server'
export const permissions = ['BAN_MEMBERS']
export const usage = 'ban @user'
export function execute(client: client, message: Message, args) {
	KickOrBan(message, args, 'ban')
}
