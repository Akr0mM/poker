import { Meteor } from 'meteor/meteor';
import { Hands } from './collections';

Meteor.publish('hands', () => Hands.find({}));
