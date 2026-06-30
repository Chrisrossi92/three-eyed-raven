import type {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

export type CommandContext = {
  interaction: ChatInputCommandInteraction;
};

export type RavenCommandData = {
  readonly name: string;
  toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
};

export type RavenCommand = {
  data: RavenCommandData;
  execute(context: CommandContext): Promise<void>;
};
