import {
  loadAchievements,
  loadChronicle,
  loadHouses,
  loadPlayers,
  loadRealm,
  loadSubmissions
} from "../src/data/ravenStore.js";

const realm = await loadRealm();
const houses = await loadHouses();
const players = await loadPlayers();
const chronicle = await loadChronicle();
const achievements = await loadAchievements();
const submissions = await loadSubmissions();

console.log(`Current Age: ${realm.currentAge}`);
console.log(`Recognized Houses: ${houses.map((house) => house.name).join(", ")}`);
console.log(`Players: ${players.length}`);
console.log(`Chronicle Entries: ${chronicle.length}`);
console.log(`Achievements: ${achievements.length}`);
console.log(`Submissions: ${submissions.length}`);
