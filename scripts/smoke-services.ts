import {
  loadChronicle,
  loadHouses,
  loadPlayers,
  loadRealm,
  loadSubmissions,
  saveChronicle,
  saveHouses,
  savePlayers,
  saveRealm,
  saveSubmissions
} from "../src/data/ravenStore.js";
import { recordChronicleEntry } from "../src/services/chronicleService.js";
import { assignPlayerToHouse, getHouseById, recognizeHouse } from "../src/services/houseService.js";
import { getRealmStatus } from "../src/services/realmService.js";

const originalRealm = await loadRealm();
const originalHouses = await loadHouses();
const originalPlayers = await loadPlayers();
const originalChronicle = await loadChronicle();
const originalSubmissions = await loadSubmissions();

try {
  const beforeStatus = await getRealmStatus();
  console.log(`Realm: ${beforeStatus.currentAge} under ${beforeStatus.ruler}`);

  const testHouseId = "house-smoke-test";
  const existingTestHouse = await getHouseById(testHouseId);
  if (!existingTestHouse) {
    await recognizeHouse({
      id: testHouseId,
      name: "House Smoke Test",
      leaderDiscordId: "smoke-leader",
      leaderRealmName: "Lord Smoke",
      leaderDisplayName: "Smoke Leader",
      settlementName: "Smoke Harbor"
    });
  }

  await assignPlayerToHouse({
    discordId: "smoke-player",
    discordUsername: "smoke.player",
    serverNickname: "Smoke Nick",
    realmName: "Ser Smoke",
    houseId: testHouseId
  });

  await recordChronicleEntry({
    id: "smoke-services-chronicle-entry",
    type: "smoke_test",
    summary: "Smoke services recorded a test Chronicle entry.",
    involvedHouses: [testHouseId],
    involvedPlayers: ["smoke-player"],
    approvedBy: "smoke-test",
    source: "manual"
  });

  const houses = await loadHouses();
  const players = await loadPlayers();
  const chronicle = await loadChronicle();
  const smokePlayer = players.find((player) => player.discordId === "smoke-player");
  const smokeHouse = houses.find((house) => house.id === testHouseId);
  console.log(`Houses: ${houses.length}`);
  console.log(`Players: ${players.length}`);
  console.log(`Chronicle Entries: ${chronicle.length}`);
  console.log(`Smoke Player Realm Name: ${smokePlayer?.realmName ?? "missing"}`);
  console.log(`Smoke House Leader Realm Name: ${smokeHouse?.leaderRealmName ?? "missing"}`);
} finally {
  await saveRealm(originalRealm);
  await saveHouses(originalHouses);
  await savePlayers(originalPlayers);
  await saveChronicle(originalChronicle);
  await saveSubmissions(originalSubmissions);
}
