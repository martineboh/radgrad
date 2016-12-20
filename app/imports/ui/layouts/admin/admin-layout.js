import { Template } from 'meteor/templating';
import * as RouteNames from '../../../startup/client/router.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.Admin_Layout.onCreated(function adminLayoutOnCreated() {
});

Template.Admin_Layout.onRendered(function adminLayoutOnRendered() {
});

Template.Admin_Layout.helpers({
  secondMenuItems() {
    return [
      { label: 'Home', route: RouteNames.adminHomePageRouteName },
      { label: 'Data Model', route: RouteNames.adminDataModelPageRouteName },
    ];
  },
  secondMenuLength() {
    return 'two';
  },
  username() {
    return FlowRouter.getParam('username');
  },
});

Template.Admin_Layout.events({
  // placeholder: if you add a form to this top-level layout, handle the associated events here.
});
