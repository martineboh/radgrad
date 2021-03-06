import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';

/** @module Slug */

/**
 * Slugs are unique strings that can be used to identify entities and can be used in URLs.
 * @extends module:Base~BaseCollection
 */
class SlugCollection extends BaseCollection {

  /**
   * Creates the SlugCollection.
   */
  constructor() {
    super('Slug', new SimpleSchema({
      name: { type: String },
      entityName: { type: String },
      entityID: { type: SimpleSchema.RegEx.Id, optional: true },
    }));
  }

  /**
   * Creates a new Slug instance and adds it to the collection.
   * @example
   * Slugs.define({ name: 'software-engineering', entityName: 'Interest' });
   * @param { String } name The name of the slug. Must be globally unique across all entities.
   * @param { String } entityName The entity it is associated with.
   * @returns { String } The docID of the created Slug.
   * @throws { Meteor.Error } If the slug already exists.
   */
  define({ name, entityName }) {
    check(name, String);
    check(entityName, String);
    if (super.isDefined(name)) {
      throw new Meteor.Error(`Attempt to redefine slug: ${name}`);
    }
    if (!this.isValidSlugName(name)) {
      throw new Meteor.Error(`Slug is not a-zA-Z0-9 or dash: ${name}`);
    }
    const docID = this._collection.insert({ name, entityName });
    return docID;
  }

  /**
   * Returns true if slugName is syntactically valid (i.e. consists of a-zA-Z0-9 or dash.)
   * @param slugName The slug name.
   * @returns {boolean} True if it's OK.
   */
  isValidSlugName(slugName) {  // eslint-disable-line
    const slugRegEx = new RegExp('^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$');
    return (typeof slugName === 'string') && slugName.length > 0 && slugRegEx.test(slugName);
  }

  /**
   * Updates a Slug with the docID of the associated entity.
   * @param { String } slugID The docID of this Slug.
   * @param { String } entityID The docID of the entity to be associated with this Slug.
   */
  updateEntityID(slugID, entityID) {
    this._collection.update(slugID, { $set: { entityID } });
  }

  /**
   * Returns the docID of the entity associated with this Slug.
   * @param { String } slugName The slug name or docID.
   * @param { String } entityName The entity type expected.
   * @returns { String } The docID of the entity.
   * @throws { Meteor.Error } If the slug or entity cannot be found or is the wrong type.
   */
  getEntityID(slugName, entityName) {
    if (!this.isDefined(slugName)) {
      throw new Meteor.Error(`Undefined slug ${slugName}.`);
    }
    const doc = this.findDoc(slugName);
    if (doc.entityName !== entityName) {
      throw new Meteor.Error(`Slug ${slugName} is not associated with the entity ${entityName}.`);
    }
    return doc.entityID;
  }

  /**
   * Returns true if slugName is a slug and is defined for the entity.
   * @param slugName The slug name.
   * @param entityName The entity for which this might be a defined slug.
   * @returns True if slugName is defined for entityName.
   */
  isSlugForEntity(slugName, entityName) {
    if (!this.isDefined(slugName)) {
      return false;
    }
    const doc = this.findDoc(slugName);
    if (doc.entityName !== entityName) {
      return false;
    }
    return true;
  }

  /**
   * Returns true if the passed slugID is defined in this collection.
   * In the case of SlugCollection, hasSlug is a synonym for isDefined, and you should use isDefined instead.
   * @param { String } slugID A docID.
   * @returns {boolean} True if the slugID is in this collection.
   */
  hasSlug(slugID) {
    return this.isDefined(slugID);
  }

  /**
   * Returns the slug name associated with this ID.
   * @param slugID The slug ID.
   * @returns The slug name.
   * @throws { Meteor.Error } If the passed slugID is not valid.
   */
  getNameFromID(slugID) {
    this.assertDefined(slugID);
    return this.findDoc(slugID).name;
  }

  /**
   * A stricter form of remove that throws an error if the document or docID could not be found in this collection.
   * @param { String | Object } docOrID A document or docID in this collection.
   */
  removeIt(docOrID) {
    super.removeIt(docOrID);
  }

  /**
   * Throws an Error if the passed slugName is not a slugName.
   * @param slugName The SlugName
   * @throws { Meteor.Error } If the passed slugName is not a slug name.
   */
  assertSlug(slugName) {
    if (!this._collection.findOne({ name: slugName })) {
      throw new Meteor.Error(`Undefined slug ${slugName}.`);
    }
  }

  /**
   * Returns an empty array (no integrity checking done on Slugs.)
   * @returns {Array} An empty array.
   */
  checkIntegrity() { // eslint-disable-line class-methods-use-this
    return [];
  }

  /**
   * Returns an object representing the passed slug docID in a format acceptable to define().
   * @param docID The docID of a Slug.
   * @returns { Object } An object representing the definition of docID.
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const name = doc.name;
    const entityName = doc.entityName;
    return { name, entityName };
  }
}

/**
 * Provides the singleton instance of a SlugCollection to all other entities.
 */
export const Slugs = new SlugCollection();
// Slugs are implicitly defined by other collections, so don't explicitly dump/restore them.
// radgradCollections.push(Slugs);


/**
 * Slugs are globally published and subscribed to when this module is loaded.
 */
Slugs.publish();
Slugs.subscribe();

/* eslint object-shorthand: "off" */

// TODO: Should methods be in their own file or at bottom of this one? I don't think we're consistent.
Meteor.methods({
  'SlugCollection.remove'(slug) {
    check(slug, String);
    Slugs.remove(slug); // TODO: 'remove(slug)' does not even exist. Why is this method defined?
  },
  'SlugCollection._removeAll'() {
    Slugs._removeAll();
  },
  'SlugCollection.define'(name, entityName) {
    check(name, String);
    check(entityName, String);
    Slugs.define(name, entityName);
  },
});
