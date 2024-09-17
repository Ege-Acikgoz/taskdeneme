const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();  // .env dosyasından değişkenleri almak için

const app = express();
const port = process.env.PORT || 5000;

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Match Schema (MongoDB için)
const matchSchema = new mongoose.Schema({
  matchId: Number,
  homeTeam: String,
  awayTeam: String,
  status: String,
  score: Object,
  utcDate: Date,
});

const Match = mongoose.model('Match', matchSchema);

// Middleware
app.use(express.json());  // JSON gövdesini analiz etmek için

// Football-data.org API'sinden maçları al
app.get('/api/matches', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
    });

    const matches = response.data.matches;

    if (!matches || matches.length === 0) {
      return res.status(404).json({ message: 'Maç verisi bulunamadı' });
    }

    // Verileri MongoDB'ye kaydet
    await Match.deleteMany({}); // Önceki verileri temizle
    const savedMatches = await Match.insertMany(matches.map(match => ({
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      status: match.status,
      score: match.score,
      utcDate: match.utcDate
    })));

    res.json(savedMatches);
  } catch (error) {
    console.error('Maç verilerini alırken hata:', error);
    res.status(500).json({ message: 'Maç verileri alınırken hata oluştu' });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
