import { Meteor } from 'meteor/meteor';
import { Hands } from './collections';

Meteor.methods({
  // eslint-disable-next-line meteor/audit-argument-checks
  'hands.create'(poker) {
    const id = Hands.insert({
      poker,
    });

    return id;
  },
});
