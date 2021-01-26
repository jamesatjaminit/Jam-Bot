module.exports = {
	name: 'invite',
	description: 'Creates an invite for the channel',
	usage: 'invite',
	execute(client, message, args, db) {
		message.channel.createInvite()
  			.then(invite => message.reply('Invite link: ' + invite.url))
  			.catch(console.error)
	},
}