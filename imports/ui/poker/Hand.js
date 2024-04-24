export default class Hand {
  constructor(poker, table) {
    this.poker = poker;
    this.table = table;

    Meteor.call('hands.create', this.poker, (error, id) => {
      if (error) {
        console.log(error);
      } else {
        this._id = id;
        Meteor.call('tables.newHand', this.table._id, this._id);
      }
    });
  }
}
