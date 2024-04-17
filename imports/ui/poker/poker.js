import { rankHands } from '@xpressit/winning-poker-hand-rank';

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
    this.showCards = false;
    this.board = [];

    this.smallBlind = 2;
    this.bigBlind = 4;
    this.initPlayers();
    this.board = ['2c', 'Js', '8c', 'Qc', 'Jh'];
    t(this.players);

    this.call();
    this.call();
    this.call();
    this.call();
    this.raise(12);
    this.call();
    this.call();
    this.fold();
    this.call();
    this.check();
    this.raise(52);
    this.raise(208);
    this.call();
    this.call();
    this.call();
    this.check();
    this.raise(442);
    this.allIn();
    this.fold();
    this.allIn();
    this.allIn();

    t(this.allPlayers);
  }

  nextTurn(move) {
    if (move) this.turn = (this.turn + 1) % this.players.length; // next player
    else this.turn %= this.players.length; // fold

    if (this.players[this.turn].allIn) {
      if (this.allPlayersAllIn()) {
        // everyone in allin so show cards
        this.showCards = true;
      } else {
        this.nextTurn(true); // next player is allIn so dont play
      }
    }
  }

  allPlayersAllIn() {
    const playersInAllIn = this.players.filter(player => player.allIn).length;

    return playersInAllIn === this.players.length;
  }

  getWinner() {
    const upperBoard = this.board.map(card => card.toLocaleUpperCase());
    const upperPlayersHand = this.players.map(player => [
      player.cards[0].toLocaleUpperCase(),
      player.cards[1].toLocaleUpperCase(),
    ]);

    const ranks = rankHands('texas', upperBoard, upperPlayersHand);
    const bestHand = ranks.reduce(
      (lowest, current) => (current.rank < lowest.rank ? current : lowest),
      ranks[0],
    );

    return ranks.indexOf(bestHand);
  }

  revealBoard() {
    // for (let i = 0; i < this.stagesRevealCards[this.stage]; i++) {
    //   const randomIndex = Math.floor(Math.random() * this.deck.length);
    //   const card = cards[this.deck[randomIndex]];
    //   this.board.push(card);
    //   this.deck.splice(randomIndex, 1);
    // }
    // l(this.board);
  }

  checkEndBetting() {
    const hasTalk = this.players.every(player => player.hasTalk);
    const notAllIn = this.players.filter(player => !player.allIn);

    let bet = false;
    if (notAllIn.length === 1) {
      if (notAllIn[0].bet >= this.betToCall) {
        this.showCards = true;
        bet = true;
      }
    } else {
      bet = notAllIn.every((player, i, arr) => player.bet === arr[0].bet);
    }

    const endRound = hasTalk && bet;

    if (endRound || this.showCards) {
      if (this.stage === 3) {
        const winner = this.players[this.getWinner()];
        winner.chips += winner.allIn ? winner.allInPot : this.pot;

        const playersAllIn = this.players.filter(p => p.allIn && p !== winner);
        if (playersAllIn.length) {
          const oppsPot = Math.round(
            (this.pot - winner.allInPot) / playersAllIn.length,
          );

          for (let i = 0; i < playersAllIn.length; i++) {
            playersAllIn[i].chips = Math.max(oppsPot, 0);
          }
        }

        this.stage = 0;
        // this.newHands();
      } else {
        if (!this.showCards) {
          for (let i = 0; i < this.players.length; i++) {
            this.players[i].bet = 0;
            this.players[i].hasTalk = false;
          }
        }

        this.revealBoard();
        this.stage += 1;

        this.turn = this.players[0].dealer ? 1 : 0;
      }
    }

    if (this.stage !== 0 && this.showCards) this.checkEndBetting();
  }

  allInPot(player, allIn) {
    let allInPot = allIn + this.pot - player.bet;

    const players = this.players.filter(p => player !== p);
    for (let i = 0; i < players.length; i++) {
      const opp = players[i];

      if (opp.bet > allIn) {
        allInPot += -opp.bet + Math.min(opp.bet, allIn);
        player.allInPotUser.push(opp.userId);
      }
    }

    return allInPot;
  }

  addToAllInPot(player, bet) {
    const playersAllIn = this.players.filter(
      p => p.allIn && p.allInStage === this.stage && p !== player,
    );

    for (let i = 0; i < playersAllIn.length; i++) {
      const opp = playersAllIn[i];

      if (!opp.allInPotUser.includes(player.userId)) {
        if (player.allIn) {
          opp.allInPot += Math.min(
            Math.min(bet, opp.bet) - player.bet,
            opp.bet,
          );
        } else {
          opp.allInPot += Math.min(bet, opp.bet);
        }

        opp.allInPotUser.push(player.userId);
      }
    }
  }

  allIn() {
    const player = this.players[this.turn];
    const allIn = player.chips + player.bet;
    player.allIn = true;
    player.allInStage = this.stage;
    player.allInPotUser = [];
    player.allInPot = this.allInPot(player, allIn);
    this.pot += allIn - player.bet;
    this.betToCall = Math.max(allIn, this.betToCall);
    player.chips = 0;

    this.addToAllInPot(player, allIn);
    player.bet = allIn;

    player.hasTalk = true;
    this.nextTurn(true);
    this.checkEndBetting();
  }

  raise(raise) {
    const player = this.players[this.turn];
    const diffToRaise = raise - player.bet;
    player.chips -= diffToRaise;
    player.bet = raise;
    this.betToCall = raise;
    this.pot += diffToRaise;

    this.addToAllInPot(player, diffToRaise);

    player.hasTalk = true;
    this.nextTurn(true);
    this.checkEndBetting();
  }

  call() {
    const player = this.players[this.turn];
    if (this.betToCall >= player.chips + player.bet) {
      this.allIn();
    } else {
      const diffToCall = this.betToCall - player.bet;
      player.bet = this.betToCall;
      player.chips -= diffToCall;
      this.pot += diffToCall;

      const playersInAllIn = this.players.filter(
        playerInAllIn => playerInAllIn.allIn,
      ).length;
      if (this.players.length === playersInAllIn - 1) {
        player.allIn = true;
      }

      this.addToAllInPot(player, diffToCall);

      player.hasTalk = true;
      this.nextTurn(true);
      this.checkEndBetting();
    }
  }

  check() {
    this.players[this.turn].hasTalk = true;
    this.nextTurn(true);
    this.checkEndBetting();
  }

  fold() {
    this.players.splice(this.turn, 1);

    if (this.players.length === 1) {
      this.players[0].chips += this.pot;
      this.newHands();
    } else {
      this.nextTurn(false);
      this.checkEndBetting();
    }
  }

  choice() {
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
      this.allPlayers[i].allIn = false;
      this.allPlayers[i].allInPot = 0;
      this.allPlayers[i].allInStage = -1;
      this.allPlayers[i].hasTalk = false;
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
    // this.shuffleHands();
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
      // this.allPlayers[i].chips = this.buyIn;
      this.allPlayers[i].bet = 0;
    }

    // dealer
    // const dealerIndex = Math.floor(Math.random() * this.allPlayers.length);
    const dealerIndex = 0;
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
  { userId: 'like_a_virgin', chips: 418, cards: ['4h', '5h'] },
  { userId: 'LuckyPete47', chips: 1399, cards: ['Tc', '6c'] },
  { userId: 'max', chips: 1611, cards: ['Kd', 'Ac'] },
  { userId: 'zonflar', chips: 308, cards: ['Jd', '3h'] },
  { userId: 'Asko1217', chips: 1218, cards: ['Jd', '3h'] },
];
const buyIn = 100;

const poker = new Poker(players, buyIn);
