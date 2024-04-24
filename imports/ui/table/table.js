import { Tables } from '../../api/tables/collections';
import { Hands } from '../../api/hands/collections';
import Poker from '../poker/Poker';
import Hand from '../poker/Hand';

import './table.html';
import './table.css';

const boardPosition = ['user-position', 'left-top', 'right-top'];

class Table {
  static initPoker(self) {
    console.warn('Poker init');
    const table = Tables.findOne({ name: self.tableName.get() });

    if (!table) {
      self.state.set('isLoading', true);
      self.state.set('tableNotFound', true);
    }

    console.log(table);

    const players = table.currentUsers.concat(table.waitingList);

    // board position
    for (let i = 0; i < players.length; i++) {
      players[i].boardPosition = boardPosition[i];
    }

    const config = {
      players,
      buyIn: table.buyIn,
      test: false,
    };

    const poker = new Poker(config);

    const hand = table.currentHand ?
      Hands.findOne({ _id: table.currentHand }) :
      new Hand(poker, table);

    console.log(hand);

    self.players = new ReactiveVar(hand.poker.allPlayers);
  }
}

Template.table.onCreated(function () {
  this.tableName = new ReactiveVar(Session.get('tableName'));

  this.state = new ReactiveDict();

  const handlerTables = Meteor.subscribe('tables');
  const handlerHands = Meteor.subscribe('hands');
  Tracker.autorun(() => {
    console.log('Tracker autorun running');
    this.state.set(
      'isLoading',
      !handlerTables.ready() || !handlerHands.ready(),
    );

    if (handlerTables.ready() && handlerHands.ready()) {
      Table.initPoker(this);
    }
  });
});

Template.table.onRendered(() => {
  const self = Template.instance();

  $('#table-name').text(self.tableName.get());
});

Template.table.helpers({
  isLoading() {
    return Template.instance()?.state.get('isLoading');
  },

  tableNotFound() {
    return Template.instance()?.state.get('tableNotFound');
  },

  currentPlayers() {
    return Template.instance()?.players.get();
  },
});
