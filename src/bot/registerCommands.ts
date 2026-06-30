import "dotenv/config";
import { REST, Routes } from "discord.js";
import { chronicleCommand } from "./commands/chronicleCommand.js";
import { crownCommand } from "./commands/crownCommand.js";
import { houseCommand } from "./commands/houseCommand.js";
import { meCommand } from "./commands/meCommand.js";
import { realmCommand } from "./commands/realmCommand.js";

const token = getRequiredEnv("DISCORD_TOKEN");
const clientId = getRequiredEnv("DISCORD_CLIENT_ID");
const guildId = getRequiredEnv("DISCORD_GUILD_ID");

const rest = new REST({ version: "10" }).setToken(token);
const commands = [
  realmCommand.data.toJSON(),
  crownCommand.data.toJSON(),
  chronicleCommand.data.toJSON(),
  houseCommand.data.toJSON(),
  meCommand.data.toJSON()
];

await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
  body: commands
});

console.log(`Registered ${commands.length} guild command for Three-Eyed Raven.`);

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to your local .env file.`);
  }

  return value;
}
