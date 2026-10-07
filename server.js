const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
app.use(express.json());

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const PORT = process.env.PORT || config.server.port || 10000;
const mongoURI = process.env.MONGO_URI || config.database.mongoURI;

const UserSchema = new mongoose.Schema({
    username: String,
    vbucks: { type: Number, default: 500 },
    lastLogin: Date
});
const User = mongoose.model('User', UserSchema);

mongoose.connect(mongoURI)
    .then(() => console.log('Project Omega erfolgreich mit MongoDB verbunden!'))
    .catch(err => console.error('MongoDB Verbindungsfehler:', err));

cron.schedule('0 0 * * *', async () => {
    try {
        const rewardAmount = config.game.vbucks || 500;
        const users = await User.find({});
        for (let user of users) {
            user.vbucks += rewardAmount;
            await user.save();
        }
        console.log('Project Omega Taeglicher Bonus wurde allen Spielern gutgeschrieben!');
    } catch (err) {
        console.error('Fehler beim Gutschreiben der taeglichen V-Bucks:', err);
    }
});

app.post('/fortnite/api/game/v2/profile/*', async (req, res) => {
    res.json({ status: "success" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server laeuft fuer ' + config.server.name);
});
