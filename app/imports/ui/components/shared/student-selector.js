import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { lodash } from 'meteor/erasaur:meteor-lodash';
import { AdminChoices } from '../../../api/admin/AdminChoiceCollection';
import { AdvisorChoices } from '../../../api/advisor/AdvisorChoiceCollection';
import { ROLE } from '../../../api/role/Role';
import {
  SessionState, sessionKeys, updateSessionState, updateAdvisorSessionState
}
  from '../../../startup/client/session-state';
import { ValidUserAccounts } from '../../../api/user/ValidUserAccountCollection';
import { Users } from '../../../api/user/UserCollection.js';

const userDefineSchema = new SimpleSchema({
  firstName: { type: String },
  lastName: { type: String },
  userName: { type: String },
  uhID: {
    type: String,
    regEx: /\d{4}-\d{4}/,
  },
});

const displaySuccessMessage = 'displaySuccessMessage';
const displayErrorMessages = 'displayErrorMessages';

Template.Student_Selector.helpers({
  userFullName() {
    if (SessionState.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const userID = SessionState.get(sessionKeys.CURRENT_STUDENT_ID);
      return Users.getFullName(userID);
    }
    return 'Select a student';
  },
  userID() {
    if (SessionState.get(sessionKeys.CURRENT_STUDENT_ID)) {
      const userID = SessionState.get(sessionKeys.CURRENT_STUDENT_ID);
      const user = Users.findDoc(userID);
      return user.uhID;
    }
    return '1111-1111';
  },
  isUserSelected() {
    return SessionState.get(sessionKeys.CURRENT_STUDENT_ID);
  },
  addNewUser() {
    return Template.instance().state.get('addNewUser');
  },
  alreadyDefined() {
    return Template.instance().state.get('alreadyDefined');
  },
  notDefined() {
    return Template.instance().state.get('notDefined');
  },
  username() {
    return Template.instance().state.get('username');
  },
  successClass() {
    return Template.instance().state.get(displaySuccessMessage) ? 'success' : '';
  },
  errorClass() {
    return Template.instance().state.get(displayErrorMessages) ? 'error' : '';
  },
  displayFieldError(fieldName) {
    const errorKeys = Template.instance().context.invalidKeys();
    return lodash.find(errorKeys, (keyObj) => keyObj.name === fieldName);
  },
  fieldErrorMessage(fieldName) {
    return Template.instance().context.keyErrorMessage(fieldName);
  },
});

Template.Student_Selector.events({
  'submit .jsRetrieve': function clickJSRetrieve(event, instance) {
    event.preventDefault();
    const username = event.target.username.value;
    instance.state.set('username', username);
    const user = Users.getUserFromUsername(username);
    if (user) {
      const userID = Meteor.userId();
      if (AdminChoices.find({ adminID: userID }).count() === 1) {
        const adminChoice = AdminChoices.find({ adminID: userID }).fetch()[0];
        AdminChoices.updateUsername(adminChoice._id, username);
        AdminChoices.updateStudentID(adminChoice._id, user._id);
      }
      if (AdvisorChoices.find({ advisorID: userID }).count() === 0) {
        AdvisorChoices.define({ advisorID: userID, studentID: user._id });
      } else if (AdvisorChoices.find({ advisorID: userID }).count() === 1) {
        const advisorChoice = AdvisorChoices.find({ advisorID: userID }).fetch()[0];
        AdvisorChoices.updateUsername(advisorChoice._id, username);
        AdvisorChoices.updateStudentID(advisorChoice._id, user._id);
      }
      SessionState.set(sessionKeys.CURRENT_STUDENT_USERNAME, username);
      instance.state.set(sessionKeys.CURRENT_STUDENT_USERNAME, username);
      SessionState.set(sessionKeys.CURRENT_STUDENT_ID, user._id);
      instance.state.set(sessionKeys.CURRENT_STUDENT_ID, user._id);
      instance.state.set('notDefined', false);
    } else {
      instance.state.set(displaySuccessMessage, false);
      instance.state.set(displayErrorMessages, true);
      instance.state.set('notDefined', true);
    }
  },
  'click .jsAddNewStudent': function clickJSRetrieve(event, instance) {
    event.preventDefault();
    instance.state.set('addNewUser', true);
  },
  'click .jsCancelAdd': function clickJSCancelAdd(event, instance) {
    event.preventDefault();
    instance.state.set('addNewUser', false);
  },
  'submit .jsNewStudent': function submitNewUser(event, instance) {
    event.preventDefault();
    const firstName = event.target.firstName.value;
    const lastName = event.target.lastName.value;
    const username = event.target.username.value;
    let uhID = event.target.uhID.value;
    if (uhID.length > 0 && uhID.indexOf('-') === -1) {
      uhID = `${uhID.substring(0, 4)}-${uhID.substring(4, 8)}`;
    }
    const newStudentData = { firstName, lastName, username, uhID };
    // Clear out any old validation errors.
    instance.context.resetValidation();
    // Invoke clean so that newStudentData reflects what will be defined
    userDefineSchema.clean(newStudentData);
    // Determine validity
    instance.context.validate(newStudentData);
    if (instance.context.isValid()) {
      const notDefined = Users.find({ username }).count() === 0;
      if (notDefined) {
        ValidUserAccounts.define({ username });
        const userDefinition = {
          firstName,
          lastName,
          slug: username,
          email: `${username}@hawaii.edu`,
          role: ROLE.STUDENT,
          uhID,
        };
        const studentID = Meteor.call('Users.define', userDefinition, (error) => {
          if (error) {
            // console.log(error);
          }
        });
        SessionState.set(sessionKeys.CURRENT_STUDENT_USERNAME, username);
        instance.state.set(sessionKeys.CURRENT_STUDENT_USERNAME, username);
        SessionState.set(sessionKeys.CURRENT_STUDENT_ID, studentID);
        instance.state.set(sessionKeys.CURRENT_STUDENT_ID, studentID);
        instance.state.set('notDefined', false);
        instance.state.set(displaySuccessMessage, username);
        instance.state.set(displayErrorMessages, false);
        instance.state.set('addNewUser', false);
      } else {
        instance.state.set(displaySuccessMessage, false);
        instance.state.set(displayErrorMessages, true);
        instance.state.set('alreadyDefined', true);
        instance.state.set('username', username);
      }
    } else {
      instance.state.set(displaySuccessMessage, false);
      instance.state.set(displayErrorMessages, true);
    }
  },
});

Template.Student_Selector.onCreated(function studentSelectorOnCreated() {
  if (this.data.dictionary) {
    this.state = this.data.dictionary;
  } else {
    this.state = new ReactiveDict();
    const adminID = Meteor.userId();
    if (AdminChoices.find({ adminID }).count() === 1) {
      updateSessionState(SessionState);
      const adminChoice = AdminChoices.find({ adminID }).fetch()[0];
      this.state.set(sessionKeys.CURRENT_STUDENT_USERNAME, adminChoice.username);
      this.state.set(sessionKeys.CURRENT_STUDENT_ID, adminChoice.studentID);
    }
    if (AdvisorChoices.find({ advisorID: adminID }).count() === 1) {
      updateAdvisorSessionState(SessionState);
      const adminChoice = AdvisorChoices.find({ advisorID: adminID }).fetch()[0];
      this.state.set(sessionKeys.CURRENT_STUDENT_USERNAME, adminChoice.username);
      this.state.set(sessionKeys.CURRENT_STUDENT_ID, adminChoice.studentID);
    }
  }
  this.state.set(displaySuccessMessage, false);
  this.state.set(displayErrorMessages, false);
  this.context = userDefineSchema.namedContext('Add_Create_Student');
});

Template.Student_Selector.onRendered(function studentSelectorOnRendered() {
  this.$('.dropdown').dropdown({
    // action: 'select',
  });
  this.state.set('addNewUser', false);
});

Template.Student_Selector.onDestroyed(function studentSelectorOnDestroyed() {
  // add your statement here
});
