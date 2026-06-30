import {
  loadAchievements,
  loadChronicle,
  loadPlayers,
  saveAchievements,
  saveChronicle,
  savePlayers
} from "../src/data/ravenStore.js";
import {
  addLegacyNote,
  awardAchievement,
  grantTitle,
  listAchievements
} from "../src/services/legacyService.js";

const originalPlayers = await loadPlayers();
const originalAchievements = await loadAchievements();
const originalChronicle = await loadChronicle();

try {
  const smokePlayerId = "smoke-legacy-player";
  await awardAchievement({
    id: "smoke-legacy-achievement",
    name: "Smoke Legacy Achievement",
    description: "Awarded by the legacy smoke test.",
    category: "smoke",
    awardedToType: "player",
    awardedToId: smokePlayerId,
    displayName: "Smoke Legacy Player",
    awardedBy: "smoke-test"
  });

  const titledPlayer = await grantTitle({
    discordId: smokePlayerId,
    displayName: "Smoke Legacy Player",
    title: "Smoke Warden",
    grantedBy: "smoke-test"
  });

  await addLegacyNote({
    discordId: smokePlayerId,
    displayName: "Smoke Legacy Player",
    note: "Verified legacy note creation.",
    source: "smoke-test"
  });

  const achievements = await listAchievements();
  console.log(`Achievements: ${achievements.length}`);
  console.log(`Smoke Player Title: ${titledPlayer.currentTitle}`);
} finally {
  await savePlayers(originalPlayers);
  await saveAchievements(originalAchievements);
  await saveChronicle(originalChronicle);
}
