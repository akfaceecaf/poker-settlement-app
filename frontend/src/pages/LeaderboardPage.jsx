import { useEffect, useState, Fragment } from "react";
import "./LeaderboardPage.css";

const DATE_FILTERS = [
  { label: "All Time", days: null },
  { label: "Last 30 Days", days: 30 },
];

function LeaderboardPage() {
  const [rankings, setRankings] = useState([]);
  const [days, setDays] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      const url = days
        ? `${import.meta.env.VITE_API_URL}/players/stats?days=${days}`
        : `${import.meta.env.VITE_API_URL}/players/stats`;
      const response = await fetch(url);
      const data = await response.json();
      setRankings(data);
    };
    fetchRankings();
  }, [days]);

  return (
    <div className="container">
      <div className="date-filter">
        {DATE_FILTERS.map((filter) => (
          <button
            key={filter.label}
            className={days === filter.days ? "active" : ""}
            onClick={() => setDays(filter.days)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <h1>Leaderboard</h1>
      <div className="rankings-table">
        <div className="table-header">Player Name</div>
        <div className="table-header">Id</div>
        <div className="table-header">$</div>
        <div className="table-header">Sessions</div>
        <div className="table-header">$ / Session</div>
        {rankings.map((player) => (
          <Fragment key={player.player_id}>
            <div className="table-cell">{player.name}</div>
            <div className="table-cell">{player.player_id}</div>
            <div className="table-cell">{player.total_profit}</div>
            <div className="table-cell">{player.total_sessions}</div>
            <div className="table-cell">
              {parseFloat(player.profit_per_session).toFixed(2)}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardPage;
