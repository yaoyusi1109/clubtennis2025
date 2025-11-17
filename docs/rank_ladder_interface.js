document.addEventListener('DOMContentLoaded', () => {
  // --- DATA MANAGEMENT ---
  let players = [];
  let matches = [];

  const defaultPlayers = [
    { name: 'Alice', rating: 1500, wins: 0, losses: 0, history: [{match: 0, rating: 1500}] },
    { name: 'Bob', rating: 1500, wins: 0, losses: 0, history: [{match: 0, rating: 1500}] },
    { name: 'Charlie', rating: 1500, wins: 0, losses: 0, history: [{match: 0, rating: 1500}] },
  ];

  function saveData() {
    localStorage.setItem('tennisPlayers', JSON.stringify(players));
    localStorage.setItem('tennisMatches', JSON.stringify(matches));
  }

  function loadData() {
    const savedPlayers = localStorage.getItem('tennisPlayers');
    const savedMatches = localStorage.getItem('tennisMatches');
    
    if (savedPlayers) {
      players = JSON.parse(savedPlayers);
    } else {
      players = JSON.parse(JSON.stringify(defaultPlayers)); // Deep copy
    }

    if (savedMatches) {
      matches = JSON.parse(savedMatches);
    } else {
      matches = [];
    }
  }

  // --- ELO CALCULATION ---
  const K_FACTOR = 32;

  function getExpectedScore(rating1, rating2) {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  function updateElo(rating, expectedScore, actualScore) {
    return Math.round(rating + K_FACTOR * (actualScore - expectedScore));
  }

  // --- UI RENDERING ---
  const player1Select = document.getElementById('player1-select');
  const player2Select = document.getElementById('player2-select');
  const winnerSelect = document.getElementById('winner-select');
  const rankingsBody = document.getElementById('rankings-body');
  const matchHistoryBody = document.getElementById('match-history-body');
  const newPlayerNameInput = document.getElementById('new-player-name');

  function renderAll() {
    renderPlayerSelectors();
    renderRankings();
    renderMatchHistory();
    renderChart();
  }

  function renderPlayerSelectors() {
    const currentP1 = player1Select.value;
    const currentP2 = player2Select.value;

    player1Select.innerHTML = '';
    player2Select.innerHTML = '';
    
    players.forEach(p => {
      player1Select.add(new Option(p.name, p.name));
      player2Select.add(new Option(p.name, p.name));
    });

    player1Select.value = currentP1;
    player2Select.value = currentP2;
    updateWinnerSelector();
  }
  
  function updateWinnerSelector() {
      const p1 = player1Select.value;
      const p2 = player2Select.value;
      winnerSelect.innerHTML = '';
      if (p1 && p2 && p1 !== p2) {
          winnerSelect.add(new Option(p1, p1));
          winnerSelect.add(new Option(p2, p2));
      }
  }

  function renderRankings() {
    rankingsBody.innerHTML = '';
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
    sortedPlayers.forEach((p, index) => {
      const row = rankingsBody.insertRow();
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.rating}</td>
        <td>${p.wins}</td>
        <td>${p.losses}</td>
      `;
    });
  }

  function renderMatchHistory() {
      matchHistoryBody.innerHTML = '';
      [...matches].reverse().slice(0, 10).forEach(m => { // Show last 10 matches
          const row = matchHistoryBody.insertRow();
          row.innerHTML = `
              <td>${m.player1} (${m.p1_rating_change > 0 ? '+' : ''}${m.p1_rating_change})</td>
              <td>${m.player2} (${m.p2_rating_change > 0 ? '+' : ''}${m.p2_rating_change})</td>
              <td>${m.winner}</td>
          `;
      });
  }

  // --- CHART LOGIC ---
  let ratingsChart = null;
  function renderChart() {
      const ctx = document.getElementById('ratings-chart').getContext('2d');
      
      const datasets = players.map(player => {
          return {
              label: player.name,
              data: player.history.map(h => ({x: h.match, y: h.rating})),
              fill: false,
              tension: 0.1
          };
      });

      if (ratingsChart) {
          ratingsChart.data.datasets = datasets;
          ratingsChart.update();
      } else {
          ratingsChart = new Chart(ctx, {
              type: 'line',
              data: { datasets },
              options: {
                  scales: {
                      x: {
                          type: 'linear',
                          title: {
                              display: true,
                              text: 'Match Number'
                          }
                      },
                      y: {
                          title: {
                              display: true,
                              text: 'Elo Rating'
                          }
                      }
                  },
                  responsive: true,
                  maintainAspectRatio: false
              }
          });
      }
  }


  // --- EVENT LISTENERS ---
  document.getElementById('add-player-btn').addEventListener('click', () => {
    const newName = newPlayerNameInput.value.trim();
    if (newName && !players.find(p => p.name === newName)) {
      players.push({ name: newName, rating: 1500, wins: 0, losses: 0, history: [{match: 0, rating: 1500}] });
      newPlayerNameInput.value = '';
      saveData();
      renderAll();
    } else {
      alert("Player name cannot be empty or already exist.");
    }
  });

  document.getElementById('record-match-btn').addEventListener('click', () => {
    const p1Name = player1Select.value;
    const p2Name = player2Select.value;
    const winnerName = winnerSelect.value;

    if (p1Name === p2Name) {
      alert("Players must be different.");
      return;
    }

    const p1 = players.find(p => p.name === p1Name);
    const p2 = players.find(p => p.name === p2Name);

    const expected1 = getExpectedScore(p1.rating, p2.rating);
    const expected2 = getExpectedScore(p2.rating, p1.rating);

    const [score1, score2] = (winnerName === p1Name) ? [1, 0] : [0, 1];

    const newRating1 = updateElo(p1.rating, expected1, score1);
    const newRating2 = updateElo(p2.rating, expected2, score2);
    
    const p1_change = newRating1 - p1.rating;
    const p2_change = newRating2 - p2.rating;

    p1.rating = newRating1;
    p2.rating = newRating2;

    if (winnerName === p1Name) {
      p1.wins++;
      p2.losses++;
    } else {
      p2.wins++;
      p1.losses++;
    }
    
    const matchNum = matches.length + 1;
    p1.history.push({match: matchNum, rating: p1.rating});
    p2.history.push({match: matchNum, rating: p2.rating});

    matches.push({ player1: p1Name, player2: p2Name, winner: winnerName, p1_rating_change: p1_change, p2_rating_change: p2_change });

    saveData();
    renderAll();
  });

  player1Select.addEventListener('change', updateWinnerSelector);
  player2Select.addEventListener('change', updateWinnerSelector);

  document.getElementById('reset-data-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all players and matches? This cannot be undone.")) {
        players = JSON.parse(JSON.stringify(defaultPlayers)); // Deep copy
        matches = [];
        saveData();
        renderAll();
    }
  });

  // --- INITIALIZATION ---
  loadData();
  renderAll();
});
