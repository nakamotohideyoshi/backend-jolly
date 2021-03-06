const ObjectId = require('mongodb').ObjectID;
/**
 * Profile type
 * @typedef {Object} Profile
 * @property {String} name
 * @property {String} phone
 * @property {Boolean} verifiedPhone
 * @property {String} bio
 * @property {Boolean} receiveEmail
 * @property {Boolean} receiveSMS
 * @property {Boolean} receiveCall
 * @property {String} location
 * @property {String} distance
 * @property {String} facebook
 * @property {String} twitter
 * @property {String} linkedin
 * @property {String} youtube
 * @property {Boolean} showImageLibrary
 * @property {Boolean} showSocialLinks
 * @property {Boolean} public
 * @property {String} avatar
 * @property {String} backgroundImage
 * @property {String} resume
 * @property {Number} cred
 * @property {Boolean} clickedRoleButton
 * @property {Boolean} clickedJobButton
 * @property {Boolean} openedShareModal
 * @property {Boolean} cityFreelancer
 * @property {Boolean} activeFreelancer
 * @property {Boolean} readyAndWilling
 * @property {String} connected
 * @property {ObjectId} user_id
 * @property {Date|String} date_created
 * @property {Date|String} date_updated
 *
 */

const BaseEntityWithID = require('./base/BaseEntityWithID');

class EntityProfile extends BaseEntityWithID {

    /**
     * User constructor method.
     * @param {User} options
     */
    constructor (options) {

        super (options);

        this._name = options.name || null;
        this._phone = options.phone || null;
        this._verifiedPhone = options.verifiedPhone || false;
        this._bio = options.bio || null;
        this._receiveEmail = options.receiveEmail === undefined ? false : options.receiveEmail;
        this._receiveSMS = options.receiveSMS === undefined ? false : options.receiveSMS;
        this._receiveCall = options.receiveCall === undefined ? false : options.receiveCall;
        this._location = options.location || null;
        this._distance = options.distance || null;
        this._facebook = options.facebook || null;
        this._twitter = options.twitter || null;
        this._linkedin = options.linkedin || null;
        this._youtube = options.youtube || null;
        this._showImageLibrary = options.showImageLibrary === undefined ? true : options.showImageLibrary;
        this._showSocialLinks = options.showSocialLinks === undefined ? true : options.showSocialLinks;
        this._public = options.public === undefined ? true : options._public;
        this._avatar = options.avatar || null;
        this._backgroundImage = options.backgroundImage || null;
        this._resume = options.resume || null;
        this._cred = options.cred || 1;
        this._clickedRoleButton = options.clickedRoleButton === undefined ? false : options.clickedRoleButton;
        this._clickedJobButton = options.clickedJobButton === undefined ? false : options.clickedJobButton;
        this._openedShareModal = options.openedShareModal === undefined ? false : options.openedShareModal;
        this._cityFreelancer = options.cityFreelancer === undefined ? false : options.cityFreelancer;
        this._activeFreelancer = options.activeFreelancer === undefined ? false : options.activeFreelancer;
        this._readyAndWilling = options.readyAndWilling === undefined ? false : options.readyAndWilling;
        this._connected = options.connected || null;
        this._userId = new ObjectId(options.userId);
        this._dateCreated = options.dateCreated ? new Date(options.dateCreated) : new Date();
        this._dateUpdated = options.dateUpdated ? new Date(options.dateUpdated) : this._dateCreated;
    }

    /**
     * @param {Object} [options]
     * @return {Object}
     */
    toJson (options) {

      let data = super.toJson();

      Object.keys(this).forEach(property => {
        if (property !== '_id' && this[property] !== null) {
          const name = property.replace('_', '');
          data[name] = this[property];
        }
      });

      return data;
    }

}
module.exports = EntityProfile;
