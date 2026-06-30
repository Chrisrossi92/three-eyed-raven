import type {
  AchievementAward,
  ChronicleEntry,
  House,
  Player
} from "../data/ravenTypes.js";
import type { RealmStatus } from "../services/realmService.js";

export interface DiscordMessageField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordReadyMessage {
  title: string;
  description?: string;
  fields?: DiscordMessageField[];
  footer?: string;
}

export function formatRealmStatus(status: RealmStatus): DiscordReadyMessage {
  const recognizedHouses =
    status.recognizedHouseNames.length > 0
      ? status.recognizedHouseNames.join(", ")
      : "No Houses are recognized yet.";

  return {
    title: "Realm Status",
    description: `${status.currentAge} under ${status.ruler}.`,
    fields: [
      {
        name: "Crown",
        value: `${status.crownHouse} (${status.ruler})`,
        inline: true
      },
      {
        name: "Recognized Houses",
        value: `${recognizedHouses}\nTotal: ${status.recognizedHouseCount}`,
        inline: false
      },
      {
        name: "Royal Tribute",
        value: formatTribute(status.currentTribute),
        inline: false
      },
      {
        name: "Next Royal Hunt",
        value: formatHunt(status.nextHunt),
        inline: false
      }
    ]
  };
}

export function formatHouseStatus(house: House | undefined): DiscordReadyMessage {
  if (!house) {
    return {
      title: "House Status",
      description: "Unknown House."
    };
  }

  const fields: DiscordMessageField[] = [
    {
      name: "Leader",
      value: formatHouseLeader(house),
      inline: true
    },
    {
      name: "Status",
      value: house.status,
      inline: true
    },
    {
      name: "Members",
      value: String(house.memberDiscordIds.length),
      inline: true
    }
  ];

  fields.push({
    name: "Settlement",
    value: house.settlementName ?? "No settlement recorded.",
    inline: true
  });
  fields.push({
    name: "Alliances",
    value: formatList(house.alliances, "No alliances recorded."),
    inline: false
  });
  fields.push({
    name: "Rivals",
    value: formatList(house.rivals, "No rivals recorded."),
    inline: false
  });

  if (house.branchOf) {
    fields.push({
      name: "Branch",
      value: `Cadet branch of ${house.branchOf}.`,
      inline: false
    });
  }

  const message: DiscordReadyMessage = {
    title: house.name,
    fields
  };
  if (house.currentGoal) {
    message.description = `Current goal: ${house.currentGoal}`;
  }

  return message;
}

export function formatPlayerLegacy(
  player: Player,
  achievements: AchievementAward[]
): DiscordReadyMessage {
  const playerAchievements = achievements.filter(
    (award) => award.awardedToType === "player" && award.awardedToId === player.discordId
  );
  const recentAchievementNames = playerAchievements.slice(-3).map((award) => award.name);
  const latestNote = player.legacyNotes.at(-1);

  return {
    title: getPlayerDisplayName(player),
    description: "Player legacy",
    fields: [
      {
        name: "House",
        value: player.houseId ?? "No House recorded.",
        inline: true
      },
      {
        name: "Title",
        value: player.currentTitle ?? "No current title.",
        inline: true
      },
      {
        name: "Achievements",
        value:
          playerAchievements.length > 0
            ? `${playerAchievements.length} total\nRecent: ${recentAchievementNames.join(", ")}`
            : "No achievements recorded.",
        inline: false
      },
      {
        name: "Legacy Notes",
        value: latestNote ? `${player.legacyNotes.length} total\nLatest: ${latestNote}` : "No legacy notes recorded.",
        inline: false
      }
    ]
  };
}

export function formatChronicleEntry(entry: ChronicleEntry): DiscordReadyMessage {
  const fields: DiscordMessageField[] = [
    {
      name: "Date",
      value: formatDate(entry.date),
      inline: true
    },
    {
      name: "Type",
      value: entry.type,
      inline: true
    }
  ];

  if (entry.involvedHouses.length > 0) {
    fields.push({
      name: "Involved Houses",
      value: entry.involvedHouses.join(", "),
      inline: false
    });
  }

  if (entry.involvedPlayers.length > 0) {
    fields.push({
      name: "Involved Players",
      value: entry.involvedPlayers.join(", "),
      inline: false
    });
  }

  return {
    title: "Chronicle Record",
    description: entry.summary,
    fields,
    footer: `Source: ${entry.source}`
  };
}

export function formatAchievementAward(award: AchievementAward): DiscordReadyMessage {
  return {
    title: `Achievement Unlocked: ${award.name}`,
    description: award.description,
    fields: [
      {
        name: "Category",
        value: award.category,
        inline: true
      },
      {
        name: "Awarded To",
        value: `${award.awardedToType}: ${award.awardedToId}`,
        inline: true
      },
      {
        name: "Awarded By",
        value: award.awardedBy || "Unknown",
        inline: true
      },
      {
        name: "Date",
        value: award.awardedAt ? formatDate(award.awardedAt) : "Unknown",
        inline: true
      }
    ]
  };
}

export function renderDiscordReadyMessage(message: DiscordReadyMessage): string {
  const lines = [`# ${message.title}`];
  if (message.description) {
    lines.push(message.description);
  }

  for (const field of message.fields ?? []) {
    lines.push(`${field.name}: ${field.value}`);
  }

  if (message.footer) {
    lines.push(message.footer);
  }

  return lines.join("\n");
}

function formatTribute(tribute: RealmStatus["currentTribute"]): string {
  if (tribute.status === "Not Started") {
    return "No Royal Tribute is active.";
  }

  const updated = tribute.updatedAt ? ` Updated ${formatDate(tribute.updatedAt)}.` : "";
  return `${tribute.status}: ${tribute.summary}${updated}`;
}

function formatHunt(hunt: RealmStatus["nextHunt"]): string {
  if (hunt.status === "Not Scheduled" || !hunt.boss) {
    return "No Royal Hunt is scheduled.";
  }

  const when = hunt.scheduledFor ? ` Scheduled for ${formatDate(hunt.scheduledFor)}.` : "";
  return `${hunt.status}: ${hunt.boss}.${when} ${hunt.summary}`.trim();
}

function formatList(items: string[], emptyText: string): string {
  return items.length > 0 ? items.join(", ") : emptyText;
}

function formatHouseLeader(house: House): string {
  const leaderName =
    house.leaderRealmName?.trim() ||
    house.leaderDisplayName?.trim() ||
    house.leaderDiscordId?.trim();

  if (!leaderName) {
    return "No leader recorded.";
  }

  if (house.leaderDiscordId && leaderName !== house.leaderDiscordId) {
    return `${leaderName} (<@${house.leaderDiscordId}>)`;
  }

  return leaderName;
}

function getPlayerDisplayName(player: Player): string {
  return (
    player.realmName?.trim() ||
    player.serverNickname?.trim() ||
    player.displayName?.trim() ||
    player.discordUsername?.trim() ||
    player.discordId
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}
