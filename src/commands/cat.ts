const fetch = require('node-fetch')
module.exports = {
    name: 'cat',
    description: 'Purrrr',
    usage: 'cat',
    async execute(client, message, args, db, logger) {
        const { file } = await fetch(
            'https://aws.random.cat/meow'
        ).then((response) => response.json())
        message.channel.send(
            file || "Unable to get a kitty cat, the api's probably down"
        )
    },
}