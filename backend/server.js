const express = require('express'); // Express modülünü içe aktar
const axios = require('axios'); // Axios modülünü içe aktar
const mongoose = require('mongoose'); // Mongoose modülünü içe aktar
const cors = require('cors'); // CORS modülünü içe aktar
require('dotenv').config(); // .env dosyasını yükle

const app = express();
const port = process.env.PORT || 5000; // Port ayarı, ortam değişkeninden al veya 5000

// CORS middleware'ini kullan
app.use(cors());
app.use(express.json()); // JSON gövdesini analiz etmek için

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Match Schema (MongoDB için)
const matchSchema = new mongoose.Schema({
  matchId: { type: Number, unique: true, required: true }, // Maç ID'si, benzersiz olmalı ve zorunlu
  homeTeam: { type: String, required: true }, // Ev sahibi takım
  awayTeam: { type: String, required: true }, // Deplasman takımı
  status: { type: String, required: true }, // Maç durumu
  score: { type: Object, required: true }, // Skor bilgisi
  utcDate: { type: Date, required: true }, // UTC tarih bilgisi
});

// Match modelini oluştur
const Match = mongoose.model('Match', matchSchema);

// API endpoint - Maçları alma
app.get('/api/matches', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY } // API anahtarı
    });
    const matches = response.data.matches; // Gelen maç verisi

    // Maç verisi yoksa hata döndür
    if (!matches || matches.length === 0) {
      return res.status(404).json({ message: 'Maç verisi bulunamadı' });
    }

    // Veritabanına toplu yazma işlemi
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
        upsert: true // Eğer maç yoksa yeni ekle
      }
    }));

    await Match.bulkWrite(bulkOperations); // Toplu yazma işlemi

    res.json({ message: 'Maç verileri başarıyla güncellendi', matches });
  } catch (error) {
    console.error('Maç verilerini alırken hata:', error);
    res.status(500).json({ message: 'Maç verileri alınırken hata oluştu', error: error.message });
  }
});

// Yeni bir maç eklemek için POST isteği
app.post('/api/addMatch', async (req, res) => {
  try {
    const { matchId, homeTeam, awayTeam, status, score, utcDate } = req.body;

    // Gerekli alanların kontrolü
    if (!matchId || !homeTeam || !awayTeam || !status || !score || !utcDate) {
      return res.status(400).json({ message: 'matchId, homeTeam, awayTeam, status, score ve utcDate alanları zorunludur.' });
    }

    // Mevcut maç var mı kontrol et
    const existingMatch = await Match.findOne({ matchId });
    if (existingMatch) {
      return res.status(409).json({ message: 'Bu matchId zaten mevcut.' });
    }

    // Yeni maç oluştur
    const newMatch = new Match({
      matchId,
      homeTeam,
      awayTeam,
      status,
      score,
      utcDate
    });

    // Maçı veritabanına kaydet
    await newMatch.save();

    res.status(201).json({ message: 'Maç başarıyla eklendi', match: newMatch });
  } catch (error) {
    console.error('Maç eklenirken hata:', error);
    res.status(500).json({ message: 'Maç eklenirken hata oluştu', error: error.message });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
