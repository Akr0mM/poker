import { FlowRouter } from 'meteor/kadira:flow-router';
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
route('table');
