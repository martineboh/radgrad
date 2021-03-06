import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

Template.Student_Selector_Widget.onCreated(function studentSelectorOnCreated() {
  if (this.data.dictionary) {
    this.state = this.data.dictionary;
  } else {
    this.state = new ReactiveDict();
  }
  if (this.data.studentID) {
    this.studentID = this.data.studentID;
  }
});
