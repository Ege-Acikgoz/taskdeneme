window.onload = async function () {
    try {
        await loadMatches();
        await loadStandings();
        await loadCompetitions(); // Ligler yüklenecek
    } catch (error) {
        console.error('Sayfa yüklenirken hata oluştu:', error);
    }
};

// Maçları yükleme fonksiyonu
async function loadMatches() {
    try {
        const response = await fetch('http://localhost:5000/api/matches');
        if (!response.ok) {
            throw new Error('HTTP hatası, durum kodu: ' + response.status);
        }

        const data = await response.json();
        const matchContainer = document.getElementById('match-container');

        if (!data.matches || data.matches.length === 0) {
            matchContainer.innerHTML = '<p class="error-message">Maç verisi bulunamadı.</p>';
            return;
        }

        matchContainer.innerHTML = ''; // Önceki maçları temizle

        data.matches.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');
            matchDiv.innerHTML = `
                <h2>${match.homeTeam.name} - ${match.awayTeam.name}</h2>
                <p>${new Date(match.utcDate).toLocaleString('tr-TR', {
                    timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit'
                })}</p>
            `;
            matchDiv.onclick = () => {
                // Tıklanıldığında lig sayfasına yönlendirilir
                window.location.href = `http://localhost:5000/api/competitions/${match.competition.id}`;
            };
            matchContainer.appendChild(matchDiv);
        });
    } catch (error) {
        console.error('Maçları alırken hata oluştu:', error);
        document.getElementById('match-container').innerHTML = '<p class="error-message">Veri alınırken hata oluştu.</p>';
    }
}

// Puan durumunu yükleme fonksiyonu
async function loadStandings() {
    try {
        const response = await fetch('http://localhost:5000/api/standings');
        if (!response.ok) {
            throw new Error('HTTP hatası, durum kodu: ' + response.status);
        }

        const data = await response.json();
        const standingsTableBody = document.getElementById('standings-body');

        if (!data || data.length === 0) {
            standingsTableBody.innerHTML = '<tr><td colspan="9" class="error-message">Puan durumu bulunamadı.</td></tr>';
            return;
        }

        standingsTableBody.innerHTML = ''; // Önceki puan durumunu temizle

        data[0].table.forEach((team, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="team-name">${team.team.name}</td>
                <td>${team.playedGames}</td>
                <td>${team.won}</td>
                <td>${team.draw}</td>
                <td>${team.lost}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${team.goalDifference}</td>
                <td>${team.points}</td>
            `;
            standingsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Puan durumu alınırken hata oluştu:', error);
        document.getElementById('standings-body').innerHTML = '<tr><td colspan="9" class="error-message">Veri alınırken hata oluştu.</td></tr>';
    }
}

// Ligleri yükleme fonksiyonu
async function loadCompetitions() {
    try {
        const response = await fetch('http://localhost:5000/api/competitions');
        if (!response.ok) {
            throw new Error('HTTP hatası, durum kodu: ' + response.status);
        }

        const data = await response.json();
        const pinnedLeaguesList = document.getElementById('pinned-leagues-list');

        if (!data.competitions || data.competitions.length === 0) {
            pinnedLeaguesList.innerHTML = '<li class="error-message">Favori lig bulunamadı.</li>';
            return;
        }

        pinnedLeaguesList.innerHTML = ''; // Önceki ligleri temizle

        data.competitions.forEach(competition => {
            const leagueItem = document.createElement('li');
            leagueItem.textContent = competition.name;
            leagueItem.onclick = () => {
                window.location.href = `http://localhost:5000/api/competitions/${competition.id}`;
            };
            pinnedLeaguesList.appendChild(leagueItem);
        });
    } catch (error) {
        console.error('Ligler alınırken hata oluştu:', error);
        document.getElementById('pinned-leagues-list').innerHTML = '<li class="error-message">Veri alınırken hata oluştu.</li>';
    }
}
