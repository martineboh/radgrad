import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { FlowRouter } from 'meteor/kadira:flow-router';

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

/**
 * Define a callback to be run when after a user logs in to redirect them to their appropriate home page.
 * This is not straightforward because this callback is invoked even on a page refresh, and we don't want to do
 * anything on a page refresh.
 * To determine if the function is being invoked during a "true" login, we check to see that the userId and
 * roles fields are available. This appears to work, but might fail in subsequent updates to Meteor.
 *
 */
Accounts.onLogin(function onLogin() {
  // Our big assumption: that Meteor.userId() and the roles field are only defined on initial login.
  // We also check that the user is currently on the landing page.
  const id = Meteor.userId();
  const rolesAvailable = id && Roles.getRolesForUser(id).length === 1;
  const onLandingPage = FlowRouter.current().path && (FlowRouter.current().path === '/');
  const initialLogin = (id && rolesAvailable && onLandingPage);

  if (initialLogin) {
    console.log('processing initial login');  // eslint-disable-line no-console
    const username = Meteor.user().username;
    const role = Roles.getRolesForUser(id)[0];
    FlowRouter.go(`/${role.toLowerCase()}/${username}`);
  }
});

Accounts.onLogout(function logout() {
  FlowRouter.go('/');
});
