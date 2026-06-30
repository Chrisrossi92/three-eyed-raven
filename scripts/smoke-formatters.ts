import {
  loadAchievements,
  loadChronicle,
  loadHouses,
  loadPlayers
} from "../src/data/ravenStore.js";
import type { AchievementAward, ChronicleEntry, Player } from "../src/data/ravenTypes.js";
import {
  formatAchievementAward,
  formatChronicleEntry,
  formatHouseStatus,
  formatPlayerLegacy,
  formatRealmStatus,
  renderDiscordReadyMessage
} from "../src/formatters/discordFormatters.js";
import { getRealmStatus } from "../src/services/realmService.js";

const realmStatus = await getRealmStatus();
const houses = await loadHouses();
const players = await loadPlayers();
const chronicle = await loadChronicle();
const achievements = await loadAchievements();

const baratheon = houses.find((house) => house.id === "house-baratheon");
const sampleHouse =
  baratheon && !baratheon.leaderRealmName
    ? {
        ...baratheon,
        leaderDiscordId: "sample-leader",
        leaderRealmName: "Lord Sample Baratheon",
        leaderDisplayName: "Sample Leader"
      }
    : baratheon;

const samplePlayer: Player =
  players[0] ?? {
    discordId: "sample-player",
    discordUsername: "sample.player",
    serverNickname: "Sample Nick",
    realmName: "Ser Sample",
    houseId: "house-baratheon",
    achievements: ["sample-achievement"],
    currentTitle: "Warden of Smoke",
    legacyNotes: ["2026-06-30T00:00:00.000Z [smoke] Helped verify formatter output."]
  };

const sampleAchievement: AchievementAward =
  achievements[0] ?? {
    id: "sample-achievement",
    name: "Formatter Witness",
    description: "Verified the Raven can shape clean Discord-ready recognition.",
    category: "smoke",
    awardedToType: "player",
    awardedToId: samplePlayer.discordId,
    awardedAt: "2026-06-30T00:00:00.000Z",
    awardedBy: "smoke-test"
  };

const sampleChronicle: ChronicleEntry =
  chronicle[0] ?? {
    id: "sample-chronicle",
    date: "2026-06-30T00:00:00.000Z",
    type: "smoke_test",
    summary: "The Raven shaped its first Discord-ready Chronicle record.",
    involvedHouses: ["house-baratheon"],
    involvedPlayers: [samplePlayer.discordId],
    approvedBy: "smoke-test",
    source: "manual"
  };

console.log(renderDiscordReadyMessage(formatRealmStatus(realmStatus)));
console.log("---");
console.log(renderDiscordReadyMessage(formatHouseStatus(sampleHouse)));
console.log("---");
console.log(renderDiscordReadyMessage(formatPlayerLegacy(samplePlayer, [sampleAchievement])));
console.log("---");
console.log(renderDiscordReadyMessage(formatChronicleEntry(sampleChronicle)));
console.log("---");
console.log(renderDiscordReadyMessage(formatAchievementAward(sampleAchievement)));
