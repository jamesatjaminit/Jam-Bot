import {GuildMember} from "discord.js"


export default async function register(member: GuildMember) {
	if (member.guild.id == '779060204528074783') {
		if (
			member.id == '438815630884601856' ||
			member.id == '265933873358045185' ||
			member.id == '724842710221193217' ||
			member.id == '312272690473992202'
		) {
			await member.roles.add('781999680832929813')
		} else {
			await member.roles.add('791381859878961202')
		}
	}
}
