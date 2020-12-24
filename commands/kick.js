module.exports = {
	name: 'kick',
	description: 'Kicks a user',
	permissions: 'KICK_MEMBERS',
	usage: 'kick @user',
	execute(client, message, args, db) {
		if(!message.member.hasPermission(['KICK_MEMBERS'])) return message.reply('You do not have permission to perform this command!')
		if(!message.guild.me.hasPermission(['KICK_MEMBERS'])) return message.channel.send('I dont have permission to perform this command, make sure I can kick people!')
		const memberToKick = message.mentions.members.first() || message.guild.members.cache.get(args[0])
		if (!memberToKick) return message.reply('You didn\'t mention a valid user.')
		if (message.author.id == memberToKick.id) return message.reply('You can\'t kick yourself silly!') // Checks if the user mentioned themself
		const reason = args.splice(1).join(' ')
		const authorRole = message.member.roles.highest
		const targetRole = memberToKick.roles.highest
		if (!message.member.hasPermission(['ADMINISTRATOR'])){ // Admins without a role need to be able to overide
			if (!targetRole.comparePositionTo(authorRole) <= 0) return message.reply('You can\'t kick them, your role is lower than theirs!') // https://stackoverflow.com/questions/64056025/discord-js-ban-user-permissions-command
		} 
		message.guild.member(memberToKick).kick(memberToKick, {reason: reason})
		message.channel.send(`${memberToKick} was kicked with reason: ${reason}`)
	},
}