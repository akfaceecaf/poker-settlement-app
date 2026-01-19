export const calcSettlements = (payments) => {
  const sumCashIn = payments.reduce(
    (sum, player) => sum + player.cashInAmount,
    0,
  );
  const sumCashOut = payments.reduce(
    (sum, player) => sum + player.cashOutAmount,
    0,
  );
  if (sumCashIn !== sumCashOut) {
    console.log("Not equal cash in and cash out");
    return [];
  }

  const balances = payments
    .map((p) => ({
      playerId: p.playerId,
      name: p.name,
      amount: p.cashOutAmount - p.cashInAmount,
    }))
    .filter((p) => p.amount !== 0);
  const winners = balances
    .filter((p) => p.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const losers = balances
    .filter((p) => p.amount < 0)
    .sort((a, b) => a.amount - b.amount);
  const settlements = [];
  let i = 0,
    j = 0;

  while (i < winners.length && j < losers.length) {
    const debt = -losers[j].amount;
    const credit = winners[i].amount;
    const payment = Math.min(debt, credit);

    settlements.push({
      payerId: losers[j].playerId,
      payerName: losers[j].name,
      receiverId: winners[i].playerId,
      receiverName: winners[i].name,
      payment: payment,
    });

    winners[i].amount -= payment;
    losers[j].amount += payment;

    if (winners[i].amount === 0) i++;
    if (losers[j].amount === 0) j++;
  }
  return settlements;
};
