/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to send a Firefox install link
 * to a mobile device via SMS.
 */

define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const FormView = require('views/form');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const PulseGraphicMixin = require('views/mixins/pulse-graphic-mixin');
  const SMSClient = require('lib/sms-client');
  const Template = require('stache!templates/send_sms');

  /*eslint-enable camelcase*/

  const View = FormView.extend({
    template: Template,

    context () {
      const escapedLearnMoreAttributes =
          `href="${encodeURI('https://support.mozilla.org')}" target="_blank"`;

      return {
        escapedLearnMoreAttributes
      };
    },

    submit () {
      const phoneNumber = this.getElementValue('.phone-number');
      const email = this.model.get('email');
      return SMSClient.send(phoneNumber, email)
        .then(() => {
          return this.navigate('sms_sent', {
            phoneNumber: phoneNumber,
          });
        })
        .fail((err) => {
          this.displayError(err.message);
        });
    }
  });

  Cocktail.mixin(
    View,
    MarketingMixin,
    PulseGraphicMixin
  );

  module.exports = View;
});
