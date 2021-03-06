import {
  Client,
  Command,
  CommandMessage,
  Description,
  Guard,
  Infos,
} from "@typeit/discord";
import SETUP_CONFIG from "../config";
import { BotJoinedVoiceChannel } from "../guards/BotJoinedVoicechannel";
import { InVoiceChannel } from "../guards/InVoiceChannel";
import { Logger } from "../logger/Logger";
import { GuildCommander } from "../logic/GuildCommander";
import { JuanitaCommand } from "../types";
import { queueEmbed } from "../utils/helpers";
import { logAndRefresh, RegexOrString, validateAlias } from "./utils/helpers";

const checkAliases = (
  command?: CommandMessage,
  client?: Client
): RegExp | string => {
  return validateAlias(command, Q._aliases, RegexOrString.REGEX);
};

export default abstract class Q implements JuanitaCommand {
  static _name: string = "q";
  static _aliases: string[] = ["q", "queue", "que", "queu"];
  static _description: string = "Shows the current queue";

  @Command(checkAliases)
  @Infos({
    aliases: Q._aliases,
  })
  @Description(Q._description)
  @Guard(InVoiceChannel, BotJoinedVoiceChannel)
  async execute(command: CommandMessage) {
    const { channel, author, guild } = command;
    const juanitaGuild = GuildCommander.get(guild!);
    const { id, queue } = juanitaGuild;

    logAndRefresh(Q._name, author.tag, id, command);

    const msg = await channel.send(queueEmbed(queue));
    await msg.react("⬅️");
    await msg.react("➡️");
  }
}
