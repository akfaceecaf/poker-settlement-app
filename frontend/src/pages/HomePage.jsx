import { useState, useEffect } from "react";
import { calcSettlements } from "../utils/calcAmounts";
import "./HomePage.css";

function HomePage() {
  const [players, setPlayers] = useState([
    { id: crypto.randomUUID(), playerId: "", name: "", buyIn: "", cashOut: "" },
  ]);
  const [date, setDate] = useState("");
  const [existingPlayers, setExistingPlayers] = useState([]);
  const [hiddenDropdowns, setHiddenDropdowns] = useState(new Set());
  const [saveState, setSaveState] = useState(false);
  const [forceBalancedPot, setForceBalancedPot] = useState(true);
  const [potImbalance, setPotImbalance] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [settlements, setSettlements] = useState([]);

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];

    if (field === "name") {
      newPlayers[index].playerId = "";
      const newHidden = new Set(hiddenDropdowns);
      newHidden.delete(index);
      setHiddenDropdowns(newHidden);
    }

    newPlayers[index][field] = value;

    if (field === "cashOut" || field === "buyIn") {
      const totalBuyIn = newPlayers.reduce(
        (acc, p) => acc + parseFloat(p.buyIn || 0),
        0,
      );
      const totalCashOut = newPlayers.reduce(
        (acc, p) => acc + parseFloat(p.cashOut || 0),
        0,
      );
      setPotImbalance(totalBuyIn - totalCashOut);
    }

    setPlayers(newPlayers);
  };

  const removePlayer = (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    const totalBuyIn = newPlayers.reduce(
      (acc, p) => acc + parseFloat(p.buyIn || 0),
      0,
    );
    const totalCashOut = newPlayers.reduce(
      (acc, p) => acc + parseFloat(p.cashOut || 0),
      0,
    );
    setPotImbalance(totalBuyIn - totalCashOut);
    setPlayers(newPlayers);
  };

  const addPlayerRow = () => {
    const newPlayer = {
      id: crypto.randomUUID(),
      playerId: "",
      name: "",
      buyIn: "",
      cashOut: "",
    };
    const newPlayers = [...players, newPlayer];
    setPlayers(newPlayers);
  };

  const getFilteredPlayers = (playerName) => {
    if (!playerName) return [];
    return existingPlayers.filter(
      (p) =>
        p.name.toLowerCase().startsWith(playerName.toLowerCase()) &&
        !players.some((added) => added.playerId === p.player_id),
    );
  };

  const handleSelectPlayer = (index, selectedPlayer) => {
    const newPlayers = [...players];
    newPlayers[index].name = selectedPlayer.name;
    newPlayers[index].playerId = selectedPlayer.player_id;
    setPlayers(newPlayers);
  };

  const handleHiddenDropdowns = (index) => {
    setHiddenDropdowns(new Set([...hiddenDropdowns, index]));
  };

  const handleSaveSession = async () => {
    if (!validateSession()) {
      return;
    }

    const sessionResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date,
        }),
      },
    );
    const sessionData = await sessionResponse.json();

    const updatedPlayers = [...players];
    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (!player.playerId) {
        const playerResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/players/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: player.name,
            }),
          },
        );
        const playerData = await playerResponse.json();
        updatedPlayers[i].playerId = playerData.player_id;
      }
    }

    // session_id, player_id, buy_in_amount, cash_out_amount
    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      const sessionPlayerResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/session_players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionData.session_id,
            player_id: player.playerId,
            buy_in_amount: player.buyIn,
            cash_out_amount: player.cashOut,
          }),
        },
      );

      if (!sessionPlayerResponse.ok) {
        alert("Error saving session player");
        return;
      }
    }

    setPlayers(updatedPlayers);

    console.log("Saved");
    setSaveState(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/players`);
    const data = await response.json();
    setExistingPlayers(data);
  };

  const handleNewSession = () => {
    setPlayers([
      {
        id: crypto.randomUUID(),
        playerId: "",
        name: "",
        buyIn: "",
        cashOut: "",
      },
    ]);
    setDate("");
    setHiddenDropdowns(new Set());
    setSaveState(false);
    setSettlements([]);
    setPotImbalance(null); 
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/players`);
      const data = await response.json();
      setExistingPlayers(data);
    };
    fetchPlayers();
  }, []);

  const validateSession = () => {
    setErrorMessage("");

    if (!date) {
      setErrorMessage("Please select a date.");
      return false;
    }
    if (players.length === 0) {
      setErrorMessage("Add at least one player.");
      return false;
    }

    if (forceBalancedPot && potImbalance !== 0) {
      setErrorMessage("Pot is imbalanced.");
      return false;
    }

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player.name) {
        setErrorMessage("Blank player name.");
        return false;
      }
      if (!player.buyIn || parseFloat(player.buyIn) < 0) {
        setErrorMessage("Enter a valid buy-in amount.");
        return false;
      }
      if (!player.cashOut || parseFloat(player.cashOut) < 0) {
        setErrorMessage("Enter a valid cash-out amount.");
        alert("Enter a valid cash-out amount.");
        return false;
      }
    }
    return true;
  };

  const handleCalcSettlements = () => {
    if (!validateSession()) {
      return;
    }

    console.log(players);
    const calculatedSettlements = calcSettlements(
      players.map((p) => ({
        playerId: p.playerId || p.id,
        name: p.name,
        cashInAmount: parseFloat(p.buyIn),
        cashOutAmount: parseFloat(p.cashOut),
      })),
    );
    console.log(settlements);
    setSettlements(calculatedSettlements);
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Create A Session</h2>
        <div className="date-input">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="player-table">
          <div className="table-header">Player Name</div>
          <div className="table-header">Buy-in</div>
          <div className="table-header">Cash-out</div>
          <div className="table-header"></div>
          {players.map((player, index) => (
            <PlayerRow
              key={player.id}
              index={index}
              player={player}
              onPlayerChange={handlePlayerChange}
              onRemovePlayer={removePlayer}
              onSelectPlayer={handleSelectPlayer}
              onCloseDropdown={handleHiddenDropdowns}
              showDropdown={!hiddenDropdowns.has(index)}
              filteredPlayers={getFilteredPlayers(player.name)}
            />
          ))}
          <div className="table-cell">Total</div>
          <div className="table-cell">{players.reduce((arr, p) => arr + parseFloat(p.buyIn || 0),0).toFixed(2)}</div>
          <div className="table-cell">{players.reduce((arr, p) => arr + parseFloat(p.cashOut || 0),0).toFixed(2)}</div>
          <div className="table-cell"></div>
        </div>
        {potImbalance !== null && potImbalance !== 0 && (
          <div style={{color: "red", fontSize: "14px"}}> 
            Pot Imbalance: {potImbalance.toFixed(2)}
          </div>
        )}
        <div className="form-actions">
          <div className="button-group">
            <button onClick={addPlayerRow}>Add new player</button>
            <button onClick={handleCalcSettlements}>
              Calculate settlements
            </button>
            {!saveState ? (
              <button onClick={handleSaveSession}>Save session</button>
            ) : (
              <button onClick={handleNewSession}>New session</button>
            )}
          </div>
          <div className="checkbox-group">
            <label>Force Balanced Pot</label>
            <input
              type="checkbox"
              checked={forceBalancedPot}
              onChange={(e) => setForceBalancedPot(e.target.checked)}
            />
          </div>
        </div>
        {saveState && (
          <p style={{ color: "green", fontSize: "12px" }}>Session saved</p>
        )}
        {settlements && settlements.length > 0 && (
          <div className="settlements-card">
            <h3>Settlements</h3>
            <div className="settlements-list">
              {settlements.map((s, idx) => (
                <div key={idx} className="settlement-item">
                  <p>
                    {s.payerName} → {s.receiverName} ${s.payment.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {errorMessage && (
          <p style={{ color: "red", fontSize: "12px" }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  index,
  onPlayerChange,
  onRemovePlayer,
  onSelectPlayer,
  onCloseDropdown,
  showDropdown,
  filteredPlayers,
}) {
  return (
    <>
      <div className="table-cell">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Name"
            value={player.name}
            onChange={(e) => onPlayerChange(index, "name", e.target.value)}
          />
          {showDropdown &&
            !player.playerId &&
            (filteredPlayers.length > 0 || player.name) && (
              <div className="autocomplete-dropdown">
                {filteredPlayers.map((p) => (
                  <div
                    className="dropdown-item"
                    key={p.player_id}
                    onClick={() => onSelectPlayer(index, p)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.name}
                  </div>
                ))}
                <div
                  className="dropdown-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => onCloseDropdown(index)}
                >
                  Add New Player "{player.name}"
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="table-cell">
        <input
          type="number"
          placeholder="0.00"
          value={player.buyIn}
          onChange={(e) => onPlayerChange(index, "buyIn", e.target.value)}
        />
      </div>
      <div className="table-cell">
        <input
          type="number"
          placeholder="0.00"
          value={player.cashOut}
          onChange={(e) => onPlayerChange(index, "cashOut", e.target.value)}
        />
      </div>
      <div className="table-cell">
        <button onClick={() => onRemovePlayer(index)}>X</button>
      </div>
    </>
  );
}

export default HomePage;
