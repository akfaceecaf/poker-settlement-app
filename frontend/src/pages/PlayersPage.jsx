import { useState, useEffect } from "react";
import "./PlayersPage.css";

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch("http://localhost:3000/players/");
      const data = await response.json();
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  const handlePlayerClick = (player) => {
    const fetchPlayerDetails = async () => {
      const response = await fetch(
        `http://localhost:3000/players/${player.player_id}`
      );
      const data = await response.json();
      setSelectedPlayer(data);
      console.log(data);
    };
    fetchPlayerDetails();
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
  };

  return (
    <div className="container">
      <h1>Players</h1>
      <div className="players-grid">
        {players.map((player) => (
          <div
            className="player-card"
            key={player.player_id}
            onClick={() => handlePlayerClick(player)}
          >
            <h3>{player.name}</h3>
            <p>ID #{player.player_id}</p>
          </div>
        ))}
      </div>
      {selectedPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              Close
            </button>
            <div className="player-stats">
              <div className="player-stats-label">Total Sessions</div>
              <div className="player-stats-cell">
                {selectedPlayer.total_sessions}
              </div>
              <div className="player-stats-label">Best Session</div>
              <div className="player-stats-cell">
                {selectedPlayer.best_session != null
                  ? selectedPlayer.best_session.toFixed(2)
                  : "N/A"}
              </div>
              <div className="player-stats-label">Worst Session</div>
              <div className="player-stats-cell">
                {selectedPlayer.worst_session != null
                  ? selectedPlayer.worst_session.toFixed(2)
                  : "N/A"}
              </div>
              <div className="player-stats-label">Cumulative Profit</div>
              <div className="player-stats-cell">
                <span
                  style={{
                    color:
                      selectedPlayer.cumulative_profit > 0 ? "green" : "red",
                  }}
                >
                  {selectedPlayer.cumulative_profit != null
                    ? selectedPlayer.cumulative_profit.toFixed(2)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersPage;
