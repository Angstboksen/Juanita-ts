import {
  GuildMember,
  MessageEmbed,
  StreamDispatcher,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { JuanitaPlayer } from "../music/JuanitaPlayer";
import { Playlist } from "./Playlist";
import Queue from "./Queue";

export default class JuanitaGuild {
  id: string;
  name: string;
  textChannel: TextChannel | null = null;
  voiceChannel: VoiceChannel | null = null;
  dispatcher: StreamDispatcher | null;
  connection: VoiceConnection | null = null;
  playlists: Playlist[];
  queue: Queue = new Queue(this);

  constructor(id: string, name: string, playlists: Playlist[] = []) {
    this.id = id;
    this.name = name;
    this.playlists = playlists;
    this.dispatcher = null;
  }

  addPlaylist = (playlist: Playlist) => {
    this.playlists.push(playlist);
    return true;
  };

  validateConnection = async () => {
    if (this.connection === null || this.voiceChannel === null) {
      await this.connect();
    }
  };

  connect = async () => {
    this.connection = await this.voiceChannel!.join();
  };

  leave = () => {
    this.queue = new Queue(this);
    this.voiceChannel!.leave();
    this.connection = null;
    this.voiceChannel = null;
    if (this.dispatcher !== null) {
      this.dispatcher.destroy();
    }
    this.dispatcher = null;
  };

  send = (msg: string | MessageEmbed) => {
    this.textChannel!.send(msg);
  };

  join = async (member: GuildMember) => {
    this.voiceChannel = member.voice.channel;
    await this.connect();
  };
}
