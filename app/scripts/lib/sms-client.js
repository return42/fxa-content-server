/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A client to send SMS messages
 */

define(function (require, exports, module) {
  'use strict';

  const xhr = require('lib/xhr');

  const SMSClient = {
    /**
     * Send an SMS message
     *
     * @param {String} phoneNumber
     * @param {String} email
     * @returns {Promise}
     */
    send (phoneNumber, email) {
      return xhr.post('/sms', {
        email: email,
        to: phoneNumber
      })
      .fail((resp) => {
        throw new Error(resp.responseJSON.error);
      });
    }
  };

  module.exports = SMSClient;
});
