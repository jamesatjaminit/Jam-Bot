import { GuildMember, Message } from "discord.js";
import { BotClient, Permission } from "../customDefinitions";
import { getInvalidPermissionsMessage } from "./messages";
import { request } from "undici";
import { Logger } from "winston";
import i18next from "i18next";
import db from "./db";
import { remove as removeFromArray } from "lodash";

/**
 * Checks permissions against a guild member
 * @param member Guild member to check
 * @param permissions Permissions required
 * @returns Boolean
 */
export function checkPermissions(
  member: GuildMember,
  permissions: Array<Permission>
): boolean {
  let validPermission = true;
  if (permissions.includes("OWNER")) {
    permissions = removeItemFromArray(permissions, "OWNER");
    if (!isBotOwner(member.id)) validPermission = false;
  }
  if (permissions.length != 0) {
    if (!member.permissions.has(permissions)) validPermission = false;
  }
  return validPermission;
}

/**
 * Stops the bot and services gracefully
 * @param client Discordjs Client
 * @param stopCode Process exit code, default 0
 */
export async function stopBot(
  client: BotClient | null,
  stopCode = 0
): Promise<void> {
  try {
    if (client) {
      client.logger.warn(
        "util: Received call to stop bot, stopping with code: " + stopCode
      );
      client.destroy();
    }
    await db.$disconnect();
    process.exit(stopCode);
  } catch {
    process.exit();
  }
}

/**
 * Generates a random number between two values
 * @param min Minimum number (inclusive)
 * @param max Maximum number (inclusive)
 * @returns Random number
 */
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

/**
 *
 * @param message Initiating message
 */
export function returnInvalidPermissionMessage(message: Message): void {
  message.react("❌");
  message.channel.send(getInvalidPermissionsMessage());
}

/**
 * Uploads text to a hastebin host
 * @param logger OPTIONAL winston logger
 * @param dataToUpload Text to upload
 * @returns string Uploaded paste location
 */
export async function uploadToHasteBin(
  logger: Logger,
  dataToUpload: string
): Promise<string | null> {
  if (!dataToUpload) {
    if (logger)
      logger.error("hasteUploader: No content provided to upload, skipping...");
  }
  const hasteLocation = process.env.hasteBinHost ?? "https://hastebin.com";
  try {
    const response = await request(hasteLocation + "/documents", {
      method: "POST",
      body: dataToUpload,
    });
    if (response.statusCode != 200) return null;
    const responseData = await response.body.json();
    if (responseData.key) return `${hasteLocation}/${responseData.key}`;
  } catch (err) {
    if (logger)
      logger.error(
        "hasteUploader: Failed uploading to hastebin with error: " + err
      );
  }
  return null;
}

/**
 * Removes a specified value from an array
 * @param array Input array
 * @param value Value to remove
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeItemFromArray(
  array: Array<any>,
  value: unknown
): Array<any> {
  return removeFromArray(array, function (n: unknown) {
    return value == n;
  });
}

const owners = String(process.env.ownerId).split(",");
/**
 * Checks if a user ID is one of the bot owners
 * @param userId User ID to check
 * @returns Boolean
 */
export function isBotOwner(userId: string) {
  return owners.includes(userId);
}

let thisLogger: Logger;
export const saveLogger = (logger: Logger) => {
  thisLogger = logger;
};
export const getLogger = () => {
  return thisLogger;
};

/**
 * Converts a boolean value to a string representation
 * @param booleanToConvert Boolean to convert
 * @returns
 */
export function booleanToHuman(booleanToConvert: boolean) {
  if (booleanToConvert == true) {
    return i18next.t("misc:ON");
  } else {
    return i18next.t("misc:OFF");
  }
}

/**
 * Returns a promise for the given task
 * @param time miliseconds to wait
 * @returns  Promise
 */
export async function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
// prettier-ignore
const emojis = [
    '😄', '😃', '😀', '😊', '☺', '😉', '😍', '😘', '😚', '😗', '😙', '😜', '😝', '😛', '😳', '😁', '😔', '😌', '😒', '😞', '😣', '😢', '😂', '😭', '😪', '😥', '😰', '😅', '😓', '😩', '😫', '😨', '😱', '😠', '😡', '😤', '😖', '😆', '😋', '😷', '😎', '😴', '😵', '😲', '😟', '😦', '😧', '😈', '👿', '😮', '😬', '😐', '😕', '😯', '😶', '😇', '😏', '😑', '👲', '👳', '👮', '👷', '💂', '👶', '👦', '👧', '👨', '👩', '👴', '👵', '👱', '👼', '👸', '😺', '😸', '😻', '😽', '😼', '🙀', '😿', '😹', '😾', '👹', '👺', '🙈', '🙉', '🙊', '💀', '👽', '💩', '🔥', '✨', '🌟', '💫', '💥', '💢', '💦', '💧', '💤', '💨', '👂', '👀', '👃', '👅', '👄', '👍', '👎', '👌', '👊', '✊', '✌', '👋', '✋', '👐', '👆', '👇', '👉', '👈', '🙌', '🙏', '☝', '👏', '💪', '🚶', '🏃', '💃', '👫', '👪', '👬', '👭', '💏', '💑', '👯', '🙆', '🙅', '💁', '🙋', '💆', '💇', '💅', '👰', '🙎', '🙍', '🙇', '🎩', '👑', '👒', '👟', '👞', '👡', '👠', '👢', '👕', '👔', '👚', '👗', '🎽', '👖', '👘', '👙', '💼', '👜', '👝', '👛', '👓', '🎀', '🌂', '💄', '💛', '💙', '💜', '💚', '❤', '💔', '💗', '💓', '💕', '💖', '💞', '💘', '💌', '💋', '💍', '💎', '👤', '👥', '💬', '👣', '💭', '🐶', '🐺', '🐱', '🐭', '🐹', '🐰', '🐸', '🐯', '🐨', '🐻', '🐷', '🐽', '🐮', '🐗', '🐵', '🐒', '🐴', '🐑', '🐘', '🐼', '🐧', '🐦', '🐤', '🐥', '🐣', '🐔', '🐍', '🐢', '🐛', '🐝', '🐜', '🐞', '🐌', '🐙', '🐚', '🐠', '🐟', '🐬', '🐳', '🐋', '🐄', '🐏', '🐀', '🐃', '🐅', '🐇', '🐉', '🐎', '🐐', '🐓', '🐕', '🐖', '🐁', '🐂', '🐲', '🐡', '🐊', '🐫', '🐪', '🐆', '🐈', '🐩', '🐾', '💐', '🌸', '🌷', '🍀', '🌹', '🌻', '🌺', '🍁', '🍃', '🍂', '🌿', '🌾', '🍄', '🌵', '🌴', '🌲', '🌳', '🌰', '🌱', '🌼', '🌐', '🌞', '🌝', '🌚', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌜', '🌛', '🌙', '🌍', '🌎', '🌏', '🌋', '🌌', '🌠', '⭐', '☀', '⛅', '☁', '⚡', '☔', '❄', '⛄', '🌀', '🌁', '🌈', '🌊', '🎍', '💝', '🎎', '🎒', '🎓', '🎏', '🎆', '🎇', '🎐', '🎑', '🎃', '👻', '🎅', '🎄', '🎁', '🎋', '🎉', '🎊', '🎈', '🎌', '🔮', '🎥', '📷', '📹', '📼', '💿', '📀', '💽', '💾', '💻', '📱', '☎', '📞', '📟', '📠', '📡', '📺', '📻', '🔊', '🔉', '🔈', '🔇', '🔔', '🔕', '📢', '📣', '⏳', '⌛', '⏰', '⌚', '🔓', '🔒', '🔏', '🔐', '🔑', '🔎', '💡', '🔦', '🔆', '🔅', '🔌', '🔋', '🔍', '🛁', '🛀', '🚿', '🚽', '🔧', '🔩', '🔨', '🚪', '🚬', '💣', '🔫', '🔪', '💊', '💉', '💰', '💴', '💵', '💷', '💶', '💳', '💸', '📲', '📧', '📥', '📤', '✉', '📩', '📨', '📯', '📫', '📪', '📬', '📭', '📮', '📦', '📝', '📄', '📃', '📑', '📊', '📈', '📉', '📜', '📋', '📅', '📆', '📇', '📁', '📂', '✂', '📌', '📎', '✒', '✏', '📏', '📐', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📚', '📖', '🔖', '📛', '🔬', '🔭', '📰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🎻', '🎺', '🎷', '🎸', '👾', '🎮', '🃏', '🎴', '🀄', '🎲', '🎯', '🏈', '🏀', '⚽', '⚾', '🎾', '🎱', '🏉', '🎳', '⛳', '🚵', '🚴', '🏁', '🏇', '🏆', '🎿', '🏂', '🏊', '🏄', '🎣', '☕', '🍵', '🍶', '🍼', '🍺', '🍻', '🍸', '🍹', '🍷', '🍴', '🍕', '🍔', '🍟', '🍗', '🍖', '🍝', '🍛', '🍤', '🍱', '🍣', '🍥', '🍙', '🍘', '🍚', '🍜', '🍲', '🍢', '🍡', '🍳', '🍞', '🍩', '🍮', '🍦', '🍨', '🍧', '🎂', '🍰', '🍪', '🍫', '🍬', '🍭', '🍯', '🍎', '🍏', '🍊', '🍋', '🍒', '🍇', '🍉', '🍓', '🍑', '🍈', '🍌', '🍐', '🍍', '🍠', '🍆', '🍅', '🌽', '🏠', '🏡', '🏫', '🏢', '🏣', '🏥', '🏦', '🏪', '🏩', '🏨', '💒', '⛪', '🏬', '🏤', '🌇', '🌆', '🏯', '🏰', '⛺', '🏭', '🗼', '🗾', '🗻', '🌄', '🌅', '🌃', '🗽', '🌉', '🎠', '🎡', '⛲', '🎢', '🚢', '⛵', '🚤', '🚣', '⚓', '🚀', '✈', '💺', '🚁', '🚂', '🚊', '🚉', '🚞', '🚆', '🚄', '🚅', '🚈', '🚇', '🚝', '🚋', '🚃', '🚎', '🚌', '🚍', '🚙', '🚘', '🚗', '🚕', '🚖', '🚛', '🚚', '🚨', '🚓', '🚔', '🚒', '🚑', '🚐', '🚲', '🚡', '🚟', '🚠', '🚜', '💈', '🚏', '🎫', '🚦', '🚥', '⚠', '🚧', '🔰', '⛽', '🏮', '🎰', '♨', '🗿', '🎪', '🎭', '📍', '🚩', '⬆', '⬇', '⬅', '➡', '🔠', '🔡', '🔤', '↗', '↖', '↘', '↙', '↔', '↕', '🔄', '◀', '▶', '🔼', '🔽', '↩', '↪', 'ℹ', '⏪', '⏩', '⏫', '⏬', '⤵', '⤴', '🆗', '🔀', '🔁', '🔂', '🆕', '🆙', '🆒', '🆓', '🆖', '📶', '🎦', '🈁', '🈯', '🈳', '🈵', '🈴', '🈲', '🉐', '🈹', '🈺', '🈶', '🈚', '🚻', '🚹', '🚺', '🚼', '🚾', '🚰', '🚮', '🅿', '♿', '🚭', '🈷', '🈸', '🈂', 'Ⓜ', '🛂', '🛄', '🛅', '🛃', '🉑', '㊙', '㊗', '🆑', '🆘', '🆔', '🚫', '🔞', '📵', '🚯', '🚱', '🚳', '🚷', '🚸', '⛔', '✳', '❇', '❎', '✅', '✴', '💟', '🆚', '📳', '📴', '🅰', '🅱', '🆎', '🅾', '💠', '➿', '♻', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🔯', '🏧', '💹', '💲', '💱', '©', '®', '™', '〽', '〰', '🔝', '🔚', '🔙', '🔛', '🔜', '❌', '⭕', '❗', '❓', '❕', '❔', '🔃', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '✖', '➕', '➖', '➗', '♠', '♥', '♣', '♦', '💮', '💯', '✔', '☑', '🔘', '🔗', '➰', '🔱', '🔲', '🔳', '◼', '◻', '◾', '◽', '▪', '▫', '🔺', '⬜', '⬛', '⚫', '⚪', '🔴', '🔵', '🔻', '🔶', '🔷', '🔸', '🔹'
]

/**
 * Returns a random emoji
 * @returns Emoji
 */
export function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

import { GLOBAL_RATELIMIT_DURATION } from "../consts";
const rateLimits = new Map();

/**
 * Checks whether a user should be rate limited
 * @param commandName Name of command
 * @param commandLimit Rate limit of command in seconds
 * @param userId User ID to check
 * @returns Boolean
 */
export function checkRateLimit(
  commandName: string,
  commandLimit: number | undefined,
  userId: string
): boolean {
  if (!commandLimit) commandLimit = GLOBAL_RATELIMIT_DURATION;
  const rateLimit = rateLimits.get(`${commandName}-${userId}`) ?? 0;
  if (Date.now() < commandLimit * 1000 + rateLimit) return true;
  return false;
}

/**
 * Sets a rate limit when a user runs a command
 * @param commandName Name of command
 * @param userId User ID to rate limit
 */
export function setRateLimit(commandName: string, userId: string) {
  rateLimits.set(`${commandName}-${userId}`, Date.now());
}

/**
 * Gets the time remaining for a rate limit
 * @param commandName Name of command
 * @param commandLimit Rate limit of command in seconds
 * @param userId User ID to check
 * @returns Time remaining in MS
 */
export function getRateLimitRemaining(
  commandName: string,
  commandLimit: number | undefined,
  userId: string
) {
  if (!commandLimit) commandLimit = GLOBAL_RATELIMIT_DURATION;
  const rateLimit = rateLimits.get(`${commandName}-${userId}`);
  if (!rateLimit) return 0;
  return commandLimit * 1000 - (Date.now() - rateLimit);
}

export function warnForOmittedEnvs(logger: Logger) {
  if (!process.env.ownerId || !process.env.ownerName) {
    logger.warn("Owner information not provided in .env");
  }
  if (!process.env.guildLogChannel || !process.env.dmChannel) {
    logger.warn("Guild log channel(s) not provided in .env");
  }
  if (!process.env.devServerId) {
    logger.warn("Dev server ID not provided in .env");
  }
  if (!process.env.errorLogWebhookUrl) {
    logger.warn("Error webhook not provided in .env");
  }
  if (!process.env.sentryUrl) {
    logger.warn("Sentry url not provided in .env");
  }
  if (
    !process.env.twitchNotificationsChannel ||
    !process.env.twitchNotificationsUsername
  ) {
    logger.warn("Twitch channel information not provided in .env");
  }
  if (!process.env.twitchApiSecret || !process.env.twitchApiClientId) {
    logger.warn("Twitch auth credentials not provided in .env");
  }
  if (!process.env.bingImageSearchKey || !process.env.pexelsApiKey) {
    logger.warn("Image auth credentials not specified in .env");
  }
}
