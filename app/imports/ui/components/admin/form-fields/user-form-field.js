import { Template } from 'meteor/templating';

Template.User_Form_Field.onRendered(function onRendered() {
  this.$('.dropdown').dropdown();
});

Template.User_Form_Field.helpers({
  isSelected(user, selectedUser) {
    return user === selectedUser;
  },
  userName(user) {
    return `${user.firstName} ${user.lastName}`;
  },
});
