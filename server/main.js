import { Meteor } from 'meteor/meteor';
import '../imports/api/tables/methods';
import '../imports/api/tables/publish';
import '../imports/api/hands/methods';
import '../imports/api/hands/publish';

import './accounts';

Meteor.startup(() => {
  // code to run on server at startup
});
