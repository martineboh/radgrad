/**
 * Created by ataka on 10/30/16.
 */
import { Template } from 'meteor/templating';


Template.Student_Ice_Help.events({
  // add your events here
});

Template.Student_Ice_Help.onCreated(function () {
  // add your statement here
});

Template.Student_Ice_Help.onRendered(function () {
  this.$('.ui.accordion').accordion('close', 0);
});

Template.Student_Ice_Help.onDestroyed(function () {
  // add your statement here
});
