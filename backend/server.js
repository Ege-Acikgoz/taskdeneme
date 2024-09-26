const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Match şeması
const matchSchema = new mongoose.Schema({
  matchId: { type: Number, unique: true, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  status: { type: String, required: true },
  score: {
    fullTime: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 }
    }
  },
  utcDate: { type: Date, required: true },
});

// Model
const Match = mongoose.model('Match', matchSchema);

// Maç verilerini alma endpoint'i
app.get('/api/matches', async (req, res) => {
  try {
    // API anahtarının doğru olup olmadığını kontrol et
    if (!process.env.FOOTBALL_API_KEY) {
      return res.status(400).json({ message: 'API anahtarı eksik' });
    }

    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
    });

    console.log('Maç verisi yanıtı:', response.data); // Yanıtı logla
    const matches = response.data.matches;

    if (!matches || matches.length === 0) {
      return res.status(404).json({ message: 'Maç verisi bulunamadı' });
    }

    // Bulk operasyonlar için veri hazırlama
    const bulkOperations = matches.map(match => ({
      updateOne: {
        filter: { matchId: match.id },
        update: {
          $set: {
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            status: match.status,
            score: match.score,
            utcDate: match.utcDate
          }
        },
        upsert: true
      }
    }));

    // BulkWrite ile verileri güncelle
    await Match.bulkWrite(bulkOperations);
    res.json({ message: 'Maç verileri başarıyla güncellendi', matches });
  } catch (error) {
    console.error('Maç verilerini alırken hata:', error);
    res.status(500).json({ message: 'Maç verileri alınırken hata oluştu', error: error.message });
  }
});

// Puan durumu alma endpoint'i
app.get('/api/standings', async (req, res) => {
  try {
    // API anahtarının var olup olmadığını kontrol et
    if (!process.env.FOOTBALL_API_KEY) {
      return res.status(400).json({ message: 'API anahtarı eksik' });
    }

    const response = await axios.get('https://api.football-data.org/v4/competitions/DED/standings', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
    });

    console.log('Puan durumu yanıtı:', response.data); // Yanıtı kontrol et
    const standings = response.data.standings;

    if (!standings || standings.length === 0) {
      return res.status(404).json({ message: 'Puan durumu verisi bulunamadı' });
    }

    res.json(standings);
  } catch (error) {
    // Hataları daha detaylı görmek için error.response'u kontrol et
    console.error('Puan durumu verilerini alırken hata:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Puan durumu verileri alınırken hata oluştu', error: error.message });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
