import type { InteractionReplyOptions } from "discord.js";
import type { DiscordReadyMessage } from "../formatters/discordFormatters.js";

export function toDiscordReplyPayload(
  message: DiscordReadyMessage,
  options: { ephemeral?: boolean } = {}
): InteractionReplyOptions {
  const embed: NonNullable<InteractionReplyOptions["embeds"]>[number] = {
    title: message.title
  };

  if (message.description) {
    embed.description = message.description;
  }
  if (message.fields && message.fields.length > 0) {
    embed.fields = message.fields.map((field) => {
      const mappedField: {
        name: string;
        value: string;
        inline?: boolean;
      } = {
        name: field.name,
        value: field.value
      };

      if (field.inline !== undefined) {
        mappedField.inline = field.inline;
      }

      return mappedField;
    });
  }
  if (message.footer) {
    embed.footer = {
      text: message.footer
    };
  }

  const payload: InteractionReplyOptions = {
    embeds: [embed]
  };

  if (options.ephemeral !== undefined) {
    payload.ephemeral = options.ephemeral;
  }

  return payload;
}
