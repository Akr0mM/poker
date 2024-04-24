import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

const route = name => FlowRouter.route(`/${name}`, {
  name,
  action() {
    BlazeLayout.render('layout', { mainTemplate: name });
  },
});

FlowRouter.route('/', {
  triggersEnter: [
    function (context, redirect) {
      FlowRouter.withReplaceState(() => {
        redirect('/home');
      });
    },
  ],
});

route('home');

FlowRouter.route('/:table', {
  name: 'table',
  action(params, queryParams) {
    BlazeLayout.render('layout', { mainTemplate: 'table' });
    if (queryParams && queryParams.name) {
      Session.set('tableName', queryParams.name);
    } else {
      console.error('Unvalid URL');
    }
  },
});
