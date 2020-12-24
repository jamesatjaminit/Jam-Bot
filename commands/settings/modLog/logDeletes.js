const updateKey = require('../../../functions/updateKey')
module.exports = {
	async execute(client, message, args, db,) {
		const toggle = String(args[2]).toLowerCase()
		if (!toggle || !toggle == 'on' || !toggle == 'off'){
			return message.channel.send('You need to specify whether you want to toggle logging deletes \'on\' or \'off\'')
		}
		updateKey.execute(db, message.guild, 'logDeletedMessages', toggle)
		message.channel.send(`Turned logging deletes ${toggle}`)
	}
}