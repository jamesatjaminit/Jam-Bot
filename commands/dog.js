const fetch = require('node-fetch')
module.exports = {
	name: 'dog',
	description: 'Woof',
	usage: 'dog',
	async execute(client, message, args, db) {
		if (args[0]) {
			if (args[1]) { // Wants to get breed and sub breed
				var data = await fetch(`https://dog.ceo/api/breed/${args[1]}/${args[0]}/images/random`).then(response => response.json())
			} else { // Just breed
				var data = await fetch(`https://dog.ceo/api/breed/${args[0]}/images/random`).then(response => response.json())
			}
		} else { // Just random dog
			var data = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json())
		}
		message.channel.send(data.message || 'Unable to get a doggy, the api\'s probably down')
	}
}
