// src/LiveMatchBulletin.js

import React, { useState, useEffect } from 'react';
import './macbülteni.css';

const macbülteni = () => {
  // Örnek maç verileri
  const [matches, setMatches] = useState([
    { team1: 'Team A', team2: 'Team B', score: '0-0' },
    { team1: 'Team C', team2: 'Team D', score: '0-0' },
    { team1: 'Team E', team2: 'Team F', score: '0-0' },
    { team1: 'Team G', team2: 'Team H', score: '0-0' },
    { team1: 'Team I', team2: 'Team J', score: '0-0' },
    { team1: 'Team K', team2: 'Team L', score: '0-0' },
    { team1: 'Team M', team2: 'Team N', score: '0-0' },
    { team1: 'Team O', team2: 'Team P', score: '0-0' },
    { team1: 'Team Q', team2: 'Team R', score: '0-0' },
    { team1: 'Team S', team2: 'Team T', score: '0-0' },
  ]);

  useEffect(() => {
    // Canlı güncelleme simülasyonu
    const interval = setInterval(() => {
      setMatches(prevMatches =>
        prevMatches.map(match => ({
          ...match,
          score: `${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 5)}`,
        }))
      );
    }, 10000); // Her 10 saniyede bir güncellenir

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mac-bülteni">
      <h2>Canlı Maç Bülteni</h2>
      <ul>
        {matches.map((match, index) => (
          <li key={index}>
            {match.team1} vs {match.team2} - {match.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default macbülteni;
