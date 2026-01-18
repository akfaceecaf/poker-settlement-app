import { useState, useEffect } from "react";
import "./SessionsPage.css";

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions/`);
      const data = await response.json();
      setSessions(data);
    };
    fetchSessions();
  }, []);

  const handleSelectedSession = (session) => {
    const fetchSessionDetails = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/sessions/${session.session_id}/players`,
      );
      const data = await response.json();
      setSelectedSession(data);
      console.log(data);
    };
    fetchSessionDetails();
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  return (
    <div className="container">
      <h1>Sessions</h1>
      <div className="sessions-grid">
        {sessions.map((session) => (
          <div
            className="session-card"
            key={session.session_id}
            onClick={() => handleSelectedSession(session)}
          >
            <h3>Session #{session.session_id}</h3>
            <p>
              {new Date(session.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </p>
          </div>
        ))}
      </div>
      {selectedSession && (
        <div className="modal-overlay">
          <div className="session-details">
            <button className="close-button" onClick={handleCloseModal}>
              Close
            </button>
            <div className="session-table">
              <div className="session-table-header">Player</div>
              <div className="session-table-header">Buy-In Amount</div>
              <div className="session-table-header">Cash-Out Amount</div>
              <div className="session-table-header">Profit</div>
              {selectedSession.map((player) => (
                <>
                  <div className="session-table-cell" key={player.player_id}>
                    {player.name}
                  </div>
                  <div className="session-table-cell">
                    {player.buy_in_amount}
                  </div>
                  <div className="session-table-cell">
                    {player.cash_out_amount}
                  </div>
                  <div
                    className="session-table-cell"
                    style={{ color: player.profit > 0 ? "green" : "red" }}
                  >
                    {player.profit != null ? player.profit : "N.A"}
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionsPage;
