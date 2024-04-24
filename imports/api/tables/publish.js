import { Meteor } from 'meteor/meteor';
import { Tables } from './collections';

Meteor.publish('tables', () => Tables.find({}));
