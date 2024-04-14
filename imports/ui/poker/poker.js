const cards = [
  '2c',
  '2d',
  '2h',
  '2s',
  '3c',
  '3d',
  '3h',
  '3s',
  '4c',
  '4d',
  '4h',
  '4s',
  '5c',
  '5d',
  '5h',
  '5s',
  '6c',
  '6d',
  '6h',
  '6s',
  '7c',
  '7d',
  '7h',
  '7s',
  '8c',
  '8d',
  '8h',
  '8s',
  '9c',
  '9d',
  '9h',
  '9s',
  'Tc',
  'Td',
  'Th',
  'Ts',
  'Jc',
  'Jd',
  'Jh',
  'Js',
  'Qc',
  'Qd',
  'Qh',
  'Qs',
  'Kc',
  'Kd',
  'Kh',
  'Ks',
  'Ac',
  'Ad',
  'Ah',
  'As',
];

const l = (a, b) => {
  if (b !== undefined) {
    console.log(a, b);
  } else {
    console.log(a);
  }
};

const t = (m, arr) => {
  if (arr !== undefined) {
    console.log(`${m}: `);
    console.table(arr);
  } else {
    console.table(m);
  }
};

const PREFLOP = 'preflop';
const FLOP = 'flop';
const TURN = 'turn';
const RIVER = 'river';
const CHECK = 'check';
const CALL = 'call';

export default class Poker {
  constructor(players, buyIn) {
    this.allPlayers = players;
    this.buyIn = buyIn;
    this.smallBlind = Math.round((this.buyIn / 200) * 100) / 100;
    this.bigBlind = this.smallBlind * 2;
    this.pot = 0;
    this.betToCall = 0;
    this.stage = 0;
    this.stages = [PREFLOP, FLOP, TURN, RIVER];
    this.stagesRevealCards = [3, 1, 1];
    this.turn = 3;
    this.board = [];

    this.initPlayers();
    this.board = ['As', '3d', '3h', 'Td', 'Ts'];
    this.players = [{ cards: ['3c', 'Ac'] }, { cards: ['Th', 'Tc'] }];
    this.getWinner();
  }

  getWinner() {
    for (let i = 0; i < this.players.length; i++) {
      const hand = this.board.concat(this.players[i].cards);
      const recurrences = [];
      for (let j = 0; j < 7; j++) {
        const card = hand[j];
        let recurrence = 1;
        // check pair, three, four
        for (let k = j + 1; k < 7; k++) {
          if (card[0] === hand[k][0]) recurrence += 1;
        }
        recurrences.push(recurrence);
      }

      l(hand);
      l(recurrences);

      if (recurrences.every(recu => recu === 1)) {
        l('high');
      } else {
        for (let i = 0; i < 7; i++) {
          const cards = [];
          if (recurrences[i] !== 1) {
            cards.push({
              card: hand[i][0],
              cards: [hand[i]],
              recu: recurrences[i],
            });
          }
        }
      }
    }
  }

  revealBoard() {
    for (let i = 0; i < this.stagesRevealCards[this.stage]; i++) {
      const randomIndex = Math.floor(Math.random() * this.deck.length);
      const card = cards[this.deck[randomIndex]];
      this.board.push(card);
      this.deck.splice(randomIndex, 1);
    }
  }

  checkEndBetting() {
    const endRound = this.players.every(
      (player, index, array) => player.bet === array[0].bet,
    );

    if (endRound) {
      if (this.stage === 3) {
        const winner = this.getWinner();
        this.players[winner].chips += this.pot;
        this.newHands();
      } else {
        for (let i = 0; i < this.players.length; i++) {
          this.players[i].bet = 0;
        }

        this.revealBoard();
        this.stage += 1;

        this.turn = this.players[0].dealer ? 1 : 0;
      }
    }
  }

  playerRaise(raise) {
    this.players[this.turn].bet = raise;
    this.players[this.turn].chips -= raise;
    this.betToCall = raise;
    this.pot += raise;
    this.turn = (this.turn + 1) % this.players.length;
    this.checkEndBetting();
  }

  playerCall() {
    const diffToCall = this.betToCall - this.players[this.turn].bet;
    this.players[this.turn].bet = this.betToCall;
    this.players[this.turn].chips -= diffToCall;
    this.pot += diffToCall;
    this.turn = (this.turn + 1) % this.players.length;
    this.checkEndBetting();
  }

  playerCheck() {
    this.turn = (this.turn + 1) % this.players.length;
    this.checkEndBetting();
  }

  playerFold() {
    this.players.splice(this.turn, 1);

    if (this.players.length === 1) {
      this.players[0].chips += this.pot;
      this.newHands();
    }

    this.turn %= this.players.length;
    this.checkEndBetting();
  }

  playerChoice() {
    if (this.betToCall > 0) {
      return CALL;
    } else {
      return CHECK;
    }
  }

  newHands() {
    this.pot = 0;
    this.betToCall = 0;
    this.stage = 0;
    this.turn = 3 % this.allPlayers.length;
    this.board = [];

    this.shuffleHands();
    this.movePlayersPosition();

    this.players = this.allPlayers.slice();
    t('players 117', this.players);
  }

  movePlayersPosition() {
    for (let i = 0; i < this.allPlayers.length; i++) {
      this.allPlayers[i].bet = 0;
    }

    // dealer
    this.allPlayers[0].dealer = false;
    this.allPlayers[1].dealer = true;
    this.allPlayers = this.allPlayers
      .slice(1)
      .concat(this.allPlayers.slice(0, 1));

    // small blind
    this.allPlayers[0].smallBlind = false;
    this.allPlayers[1].smallBlind = true;
    this.allPlayers[1].bet = this.smallBlind;
    this.allPlayers[1].chips -= this.smallBlind;
    this.pot += this.smallBlind;

    // big blind
    this.allPlayers[1].bigBlind = false;
    this.allPlayers[2 % this.allPlayers.length].bigBlind = true;
    this.allPlayers[2 % this.allPlayers.length].bet = this.bigBlind;
    this.allPlayers[2 % this.allPlayers.length].chips -= this.bigBlind;
    this.pot += this.bigBlind;
    this.betToCall = this.bigBlind;
  }

  initPlayers() {
    this.shuffleHands();
    this.setPlayersPosition();
    this.players = this.allPlayers.slice();
    this.turn %= this.players.length;
  }

  shuffleHands() {
    this.deck = [];
    for (let i = 0; i < 52; i++) {
      this.deck.push(i);
    }

    for (let i = 0; i < this.allPlayers.length; i++) {
      const playerCards = [];

      for (let j = 0; j < 2; j++) {
        const randomIndex = Math.floor(Math.random() * this.deck.length);
        const card = cards[this.deck[randomIndex]];
        playerCards.push(card);
        this.deck.splice(randomIndex, 1);
      }

      this.allPlayers[i].cards = playerCards;
    }
  }

  setPlayersPosition() {
    // players chips
    for (let i = 0; i < this.allPlayers.length; i++) {
      this.allPlayers[i].chips = this.buyIn;
      this.allPlayers[i].bet = 0;
    }

    // dealer
    const dealerIndex = Math.floor(Math.random() * this.allPlayers.length);
    this.allPlayers[dealerIndex].dealer = true;
    this.allPlayers = this.allPlayers
      .slice(dealerIndex)
      .concat(this.allPlayers.slice(0, dealerIndex));

    // small blind
    this.allPlayers[1].smallBlind = true;
    this.allPlayers[1].bet = this.smallBlind;
    this.allPlayers[1].chips -= this.smallBlind;
    this.pot += this.smallBlind;

    // big blind
    this.allPlayers[2 % this.allPlayers.length].bigBlind = true;
    this.allPlayers[2 % this.allPlayers.length].bet = this.bigBlind;
    this.allPlayers[2 % this.allPlayers.length].chips -= this.bigBlind;
    this.pot += this.bigBlind;
    this.betToCall = this.bigBlind;
  }
}

const players = [
  { userId: 'max' },
  { userId: 'bot' },
  { userId: 'tez' },
  { userId: 'cap' },
];
const buyIn = 100;

const poker = new Poker(players, buyIn);
