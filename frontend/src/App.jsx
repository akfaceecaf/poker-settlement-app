import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PlayersPage from "./pages/PlayersPage";
import SessionsPage from "./pages/SessionsPage";

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <h1>Poker Tracker</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/players">Players</Link>
          <Link to="/sessions">Sessions</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
