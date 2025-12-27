require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) { console.log("No DATABASE_URL"); process.exit(0); }
try {
    const u = new URL(url);
    console.log("Host:", u.hostname);
} catch (e) { console.log("Invalid URL"); }
