import { ColorResolvable, CommandInteraction, Message, MessageEmbed, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, MessageButton, ButtonInteraction } from "discord.js"
import { BotClient } from '../../customDefinitions'
import { SlashCommandBuilder } from '@discordjs/builders'
import axios, { AxiosResponse } from 'axios'
import { capitaliseSentence } from '../../functions/util'
import NodeCache from "node-cache"

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 })

export const name = 'define'
export const description = 'Defines a word'
export const usage = 'define word'
export const slashData = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addStringOption(option =>
		option.setName('word')
			.setDescription('The word you\'d like to define')
			.setRequired(true))
const colours: Array<ColorResolvable> = ['#805D93', '#F49FBC', '#FFD3BA', '#9EBD6E', '#169873', '#540D6E', '#EE4266']
async function returnDefineEmbed(wordToDefine: string, interactionData, userId: string) {
	let response: AxiosResponse
	const cachedValue = cache.get(wordToDefine)
	if (!cachedValue) {
		let error: string
		try {
			response = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(wordToDefine))
		} catch (err) {
			error = err
		}
		if (error || response.status != 200) {
			cache.set(wordToDefine, 'NOT_FOUND')
		} else {
			cache.set(wordToDefine, response.data[0])
		}

	}
	if (cache.get(wordToDefine) == 'NOT_FOUND') {
		const embed = new MessageEmbed
		embed.setDescription('No definitions found for: ' + wordToDefine)
		embed.setColor(colours[colours.length - 1])
		return [[embed], null]
	}
	const jsonResponse = cache.get(wordToDefine) ?? response.data[0]
	const partOfSpeechTypes = []
	// eslint-disable-next-line prefer-const
	let meaningsJson = {}
	for (const meaning of jsonResponse.meanings) {
		partOfSpeechTypes.push({ label: capitaliseSentence(meaning.partOfSpeech), value: meaning.partOfSpeech })
		meaningsJson[meaning.partOfSpeech] = meaning.definitions
	}
	const wordType = interactionData['definitionType'] ?? partOfSpeechTypes[0]['value']
	const wordToDefineHiphen = wordToDefine.split(' ').join('-')
	const selectRow = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId('define-selectmenu-' + userId + '-' + wordToDefineHiphen)
				.setPlaceholder(capitaliseSentence(wordType))
				.addOptions(partOfSpeechTypes)
		)
	const embed = new MessageEmbed
	let definitionNumberStart = interactionData['definitionStart'] ?? 1
	if (1 > definitionNumberStart) definitionNumberStart = 1
	embed.setTitle(`${capitaliseSentence(interactionData['definitionType'] ?? partOfSpeechTypes[0]['value'])}: ${capitaliseSentence(wordToDefine)}`)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const definitionsArray: Array<any> = meaningsJson[wordType]
	while (definitionNumberStart <= definitionsArray.length) {
		const definition = meaningsJson[wordType][definitionNumberStart - 1]
		embed.addField(`Definition #${definitionNumberStart}`, `${capitaliseSentence(definition.definition) ?? '*Not Available*'}`)
		definitionNumberStart++
		if (embed.fields.length == 5) {
			break
		}
	}
	let pageNumber = Math.floor(definitionNumberStart / 5)
	if (pageNumber <= 0) pageNumber = 1
	const pages = Math.ceil(definitionsArray.length / 5)
	embed.setColor(colours[pageNumber])
	embed.setFooter(`Page: ${pageNumber}/${pages}`)
	const buttonsRow = new MessageActionRow
	if (1 < interactionData['definitionStart'] ?? 1) {
		buttonsRow.addComponents(
			new MessageButton()
				.setCustomId('define-button-' + (interactionData['definitionStart'] - 5) + '-' + wordType + '-' + userId + '-' + wordToDefineHiphen)
				.setLabel('Previous')
				.setStyle('PRIMARY')
		)
	} else {
		buttonsRow.addComponents(
			new MessageButton()
				.setCustomId('define-button-disabled')
				.setDisabled(true)
				.setLabel('Previous')
				.setStyle('PRIMARY')
		)
	}
	if (definitionNumberStart < definitionsArray.length) {
		buttonsRow.addComponents(
			new MessageButton()
				.setCustomId('define-button-' + definitionNumberStart + '-' + wordType + '-' + userId + '-' + wordToDefineHiphen)
				.setLabel('Next')
				.setStyle('PRIMARY')
		)
	} else {
		buttonsRow.addComponents(
			new MessageButton()
				.setCustomId('define-button-disabled2')
				.setDisabled(true)
				.setLabel('Next')
				.setStyle('PRIMARY')
		)
	}
	return [[embed], [buttonsRow, selectRow]]
}

export async function execute(client: BotClient, message: Message, args: Array<unknown>) {
	message.channel.send('Use slash commands smh')
}

export async function executeSlash(client: BotClient, interaction: CommandInteraction) {
	await interaction.deferReply()
	const wordToDefine = interaction.options.getString('word')
	const embed = await returnDefineEmbed(wordToDefine.toLowerCase(), {}, interaction.user.id)
	// @ts-expect-error
	interaction.editReply({ embeds: embed[0], components: embed[1] })
}

export async function executeButton(client: BotClient, interaction: ButtonInteraction) {
	const interactionNameObject = interaction.customId.split('-')
	const interactionData = { 'definitionStart': parseInt(interactionNameObject[2]), 'definitionType': interactionNameObject[3] }
	const eph = interactionNameObject[4] == interaction.user.id ? false : true
	const wordToDefine = interactionNameObject.splice(5).join(' ')
	const defineEmbedData = await returnDefineEmbed(wordToDefine, interactionData, interaction.user.id)
	if (eph) {
		// @ts-expect-error
		await interaction.reply({ embeds: defineEmbedData[0], components: defineEmbedData[1], ephemeral: true })
	} else {
		// @ts-expect-error
		await interaction.update({ embeds: defineEmbedData[0], components: defineEmbedData[1] })
	}

}

export async function executeSelectMenu(client: BotClient, interaction: SelectMenuInteraction) {
	const interactionNameObject = interaction.customId.split('-')
	const interactionData = { 'definitionType': interaction.values[0] }
	const eph = interactionNameObject[2] == interaction.user.id ? false : true
	const wordToDefine = interactionNameObject.splice(3).join(' ')
	const defineEmbedData = await returnDefineEmbed(wordToDefine, interactionData, interaction.user.id)
	if (eph) {
		// @ts-expect-error
		await interaction.reply({ embeds: defineEmbedData[0], components: defineEmbedData[1], ephemeral: true })
	} else {
		// @ts-expect-error
		await interaction.update({ embeds: defineEmbedData[0], components: defineEmbedData[1] })
	}
}