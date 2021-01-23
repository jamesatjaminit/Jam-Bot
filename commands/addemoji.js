module.exports = {
	name: 'addemoji',
	description: 'Purges messages',
	permissions: '',
	usage: 'addemoji EmojiName',
	execute(client, message, args, db) {
		if (!args[0]) return message.reply('Make sure you name your emoji')
		var url = message.attachments.first()
		console.log(url.url)
		if (!url) return message.reply('Attach an image')
		message.guild.emojis.create(url.url, args[0])
			.then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
			.catch(console.error)
	},
}