const { executeQuery } = require('./lib/db');

async function checkGames() {
  try {
    const games = await executeQuery("SELECT id, name, slug, category FROM games ORDER BY name ASC");
    console.log("Total games in DB:", games.length);
    console.log(JSON.stringify(games, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

checkGames();
