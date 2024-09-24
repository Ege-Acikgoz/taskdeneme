import React, { useEffect, useState } from 'react';
import LiveMatchBulletin from './LiveMatchBulletin';
import './LiveMatchBulletin.css'; // CSS dosyasını içe aktar

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectToMongoDB = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/connectMongo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log(data);
        setLoading(false);
      } catch (error) {
        console.error('MongoDB bağlantı hatası:', error);
        setError('MongoDB bağlantı hatası');
        setLoading(false);
      }
    };

    connectToMongoDB();
  }, []);

  return (
    <div className="App">
      <h1>MongoDB'ye Bağlan</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>{error}</p>}
      <LiveMatchBulletin />
    </div>
  );
}

export default App;
