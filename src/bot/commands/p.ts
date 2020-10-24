import {
  DMChannel,
  Message,
  NewsChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ICommand, IGuild, ISong } from "../../utils/api";
import { CommandEnum } from "../../utils/enums";
import {
  botAlreadyJoined,
  isCommandNameCorrect,
  tokenize,
} from "../../utils/helpers";
import { ERRORS, LOGGER, MESSAGES } from "../../utils/messages";
import QueueConstruct from "../QueueConstruct";
import YoutubeSearcher from "../YoutubeSearcher";
import MediaPlayer from "../MediaPlayer";

const player: MediaPlayer = new MediaPlayer();

export default class P implements ICommand {
  type: CommandEnum;
  message: string;
  help: string;
  searcher: YoutubeSearcher = new YoutubeSearcher();

  constructor() {
    this.type = CommandEnum.P;
    this.message = "";
    this.help =
      "Will play the given song link, or search with the given keywords";
  }

  public isValid = (tokens: string[]): boolean => {
    return tokens.length > 1 && isCommandNameCorrect(tokens[0], this.type);
  };

  public getKeywords = (content: string): string[] => {
    const tokens: string[] = tokenize(content);
    return tokens.slice(1, tokens.length);
  };

  public prettifySongTitle = (song: ISong): ISong => {
    song.title = song.title.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF][*])/g,
      ""
    );
    return song;
  };

  public run = async (
    message: Message,
    guild: IGuild
  ): Promise<void | Message> => {
    console.log(LOGGER.RUNNING_COMMAND(this.type, message.author.tag));
    const keywords: string[] = this.getKeywords(message.content);
    const textChannel: TextChannel | DMChannel | NewsChannel = message.channel;
    const channel: VoiceChannel = message.member?.voice.channel!;

    // No parameters specified
    if (keywords.length === 0) {
      return textChannel.send(ERRORS.NEED_MORE_SONG_INFO);
    }

    const song: ISong | undefined = await this.searcher.search(
      keywords.join(" ")
    );

    // Song search failed
    if (song === undefined) {
      console.log(`No song found with keywords: ${keywords}`);
      return textChannel.send(ERRORS.NO_SONG_FOUND(keywords));
    }
    if (guild.queue === undefined) {
      guild.queue = new QueueConstruct();
      guild.queue.enqueue(song);
      guild.connection = await channel.join();
      player.play(guild);
    } else {
      guild.queue.enqueue(song);
      textChannel.send(MESSAGES.ADDED_TO_QUEUE(song.title))
      textChannel.send(await guild.queue.show())
    }
  };
}
