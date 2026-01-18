import express from "express";
import cors from "cors";
import pool from "./db.js";
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ status: result });
});

app.get("/sessions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sessions");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      "SELECT * FROM sessions WHERE session_id = $1",
      [sessionId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/sessions/:sessionId/players", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionCheck = await pool.query(
      "SELECT * FROM sessions WHERE session_id = $1",
      [sessionId],
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: "Session not found." });
    }
    const result = await pool.query(
      `SELECT
        p.player_id
        ,p.name
        ,sp.buy_in_amount
        ,sp.cash_out_amount
        ,sp.profit
      FROM session_players sp
      JOIN players p ON p.player_id = sp.player_id
      WHERE session_id = $1
      ORDER BY sp.profit DESC`,
      [sessionId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/players", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM players");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

app.get("/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const playerResult = await pool.query(
      "SELECT * FROM players WHERE player_id = $1",
      [playerId],
    );
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: "Player not found." });
    }

    const sessionResult = await pool.query(
      "SELECT * FROM session_players WHERE player_id = $1",
      [playerId],
    );

    const player = playerResult.rows[0];
    const sessions = sessionResult.rows;
    const totalSessions = sessions.length;
    const profits = sessions.map((s) => parseFloat(s.profit));
    const cumulativeProfit =
      profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) : 0;
    const bestSession = profits.length > 0 ? Math.max(...profits) : null;
    const worstSession = profits.length > 0 ? Math.min(...profits) : null;

    const response = {
      ...player,
      total_sessions: totalSessions,
      cumulative_profit: cumulativeProfit,
      best_session: bestSession,
      worst_session: worstSession,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

app.post("/sessions", async (req, res) => {
  try {
    const { date } = req.body;
    const result = await pool.query(
      "INSERT INTO sessions (date) VALUES ($1) RETURNING *",
      [date],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.post("/players", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO players (name) VALUES ($1) RETURNING *",
      [name],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create player" });
  }
});

app.post("/session_players", async (req, res) => {
  try {
    const { session_id, player_id, buy_in_amount, cash_out_amount } = req.body;
    const result = await pool.query(
      "INSERT INTO session_players (session_id, player_id, buy_in_amount, cash_out_amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [session_id, player_id, buy_in_amount, cash_out_amount],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating player session:", error);
    res.status(500).json({ error: "Failed to create player session" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
