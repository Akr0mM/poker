import './home.html';
import './home.css';

Template.home.onCreated(function () {
  this.create = new ReactiveVar(false);
  this.join = new ReactiveVar(false);
});

Template.home.events({
  'click .create'() {
    Template.instance().create.set(true);
  },

  'click .join'() {
    Template.instance().join.set(true);
  },

  'click .back'() {
    Template.instance().create.set(false);
    Template.instance().join.set(false);
  },
});

Template.home.helpers({
  create() {
    return Template.instance().create.get();
  },

  join() {
    return Template.instance().join.get();
  },
});
