import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tables } from './collections';

Meteor.methods({
  'tables.create'(name, buyIn, bigBlind, smallBlind) {
    check(name, String);
    check(buyIn, Number);
    check(bigBlind, Number);
    check(smallBlind, Number);

    const nameTaken = Tables.find({})
      .fetch()
      .some(table => table.name === name);

    if (nameTaken) {
      throw new Meteor.Error('name-taken', 'The table name is already taken.');
    }

    Tables.insert({
      name,
      buyIn,
      bigBlind,
      smallBlind,
      currentUsers: [],
      currentHand: null,
      handHistory: [],
      waitingList: [],
      active: false,
      authorId: Meteor.userId(),
    });
  },

  'tables.join'(name) {
    check(name, String);

    const table = Tables.findOne({ name });
    let usersLength = table.currentUsers.length;
    if (!table) throw new Meteor.Error('table-not-found', 'The table was not found.');

    const { _id } = table;
    const user = Meteor.users.findOne(Meteor.userId());

    if (user?.totalChips < table.buyIn) {
      throw new Meteor.Error(
        'not-enough-chips',
        'User don\'t have enough chips to join the table.',
      );
    }

    if (table.active) {
      Tables.update(
        { _id },
        {
          $push: {
            waitingList: {
              userId: user._id,
              username: user?.username,
              chips: table?.buyIn,
            },
          },
        },
      );
    } else {
      Tables.update(
        { _id },
        {
          $push: {
            currentUsers: {
              userId: user._id,
              username: user?.username,
              chips: table.buyIn,
            },
          },
        },
      );

      usersLength += 1;
    }

    if (usersLength >= 2) {
      Tables.update({ _id }, { $set: { active: true } });
    }
  },

  'tables.newHand'(table, id) {
    check(table, String);
    check(id, String);

    console.log(table);
    console.log(id);

    Tables.update(
      { _id: table },
      {
        $set: {
          currentHand: id,
        },
      },
    );
  },
});
