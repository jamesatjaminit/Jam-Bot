const gis = require('g-i-s')
const isImage = require('is-image')
const isNumber = require('is-number')
const opts = {
	searchTerm: '',
	queryStringAddition: '&safe=active' // Enable safe search, better than nothing
}
module.exports = {
	name: 'image',
	description: 'Gets a image',
	usage: 'image duck',
	async execute(client, message, args, db) {
		if (!args[0]) return message.reply('You need to specify what to search for!')
		message.channel.send(':mag_right: Finding image :mag_right:').then(sent => {
			let splitBy = 0
			if (isNumber(args[0])) {
				splitBy = 1
			}
			opts.searchTerm = args.splice(splitBy).join(' ')
			const urls = []
			gis(opts, function (error, results) {
				if (error) return
				results.forEach(element => {
					if (isImage(element.url)) {
						urls.push(element.url)
					}
				})
				if (splitBy == 0) { // Not specified image location
					sent.edit(urls[0] || 'No image found for your search')
				} else { // Get specific image
					send.edit(urls[args[0] - 1] || 'There isn\'t an image for position: ' + args[0])
				}
			})
		})

	}
}
