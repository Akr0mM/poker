/* eslint-disable no-undef */
import assert from 'assert';
import Poker from '../imports/ui/poker/poker';

const numberOfHands = 1000;

describe('no chips loss', () => {
  for (let i = 0; i < numberOfHands; i++) {
    const buyIn = Math.floor(Math.random() * (10001 - 250)) + 250;
    const numbersOfPlayers = Math.floor(Math.random() * (21 - 3)) + 3;
    const players = [];

    for (let player = 0; player < numbersOfPlayers; player++) {
      players.push({ userId: player });
    }

    const poker = new Poker({
      players,
      buyIn,
      test: { mode: 'ChipsLoss' },
    });

    const choicesHistory = [];

    while (poker.test.onGoing) {
      let choices;
      if (poker.choice() === 'check') {
        choices = [
          'fold',
          'check',
          'check',
          'check',
          'check',
          'check',
          'check',
          'raise',
          'allIn',
        ];
      } else {
        choices = ['fold', 'fold', 'call', 'call', 'raise', 'allIn'];
      }

      const choice = choices[Math.floor(Math.random() * 6)];

      if (choice === 'raise') {
        const player = poker.players[poker.turn];
        if (player.chips + player.bet <= poker.betToCall) {
          poker.allIn();
        } else {
          const raising =
            Math.floor(Math.random() * (player.chips - poker.betToCall - 1)) +
            poker.betToCall;

          poker[choice](raising);
          choicesHistory.push(`raise${raising}`);
        }
      } else {
        poker[choice]();
        choicesHistory.push(choice);
      }
    }

    const totalChips = poker.allPlayers.reduce(
      (total, player) => total + player.chips,
      0,
    );

    const startingChips = buyIn * numbersOfPlayers;

    it(`should have the same starting chips and ending chips #${i + 1}`, () => {
      if (startingChips !== totalChips) {
        // log the choices
        console.log(choicesHistory);
        console.table(poker.allPlayers);
      }
      assert.strictEqual(startingChips, totalChips);
    });
  }
});
