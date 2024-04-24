import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './home.html';
import './home.css';

Template.home.onCreated(function () {
  this.create = new ReactiveVar(false);
  this.join = new ReactiveVar(false);
});

Template.home.events({
  'click .submit-join'() {
    const name = $('#name-input').val();

    if (name !== '') {
      Meteor.call('tables.join', name, error => {
        if (error) {
          console.log(error);
        } else {
          FlowRouter.go(`/table?name=${name}`);
        }
      });
    } else {
      console.warn('Name is required');
    }
  },

  'click .submit-create'() {
    const name = $('#name-input').val();
    const buyIn = parseFloat($('#buy-in-input').val(), 10);
    const bb = parseFloat($('#bb').text(), 10);
    const sb = parseFloat($('#sb').text(), 10);

    if (name !== '' && !Number.isNaN(buyIn)) {
      Meteor.call('tables.create', name, buyIn, bb, sb, error => {
        if (error) {
          console.log(error);
        } else {
          Meteor.call('tables.join', name, err => {
            if (err) {
              console.log(err);
            } else {
              FlowRouter.go(`/table?name=${name}`);
            }
          });
        }
      });
    } else {
      console.warn('Name and buy-in are required');
    }
  },

  'input #buy-in-input'(event) {
    const { value } = event.target;
    const bb = $('#bb');
    const sb = $('#sb');

    if (value === '') {
      bb.text('~');
      sb.text('~');
    } else {
      const smb = value / 200;
      bb.text(smb * 2);
      sb.text(smb);
    }
  },

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
