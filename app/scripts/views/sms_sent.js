/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * An extremely small view that says the sms was sent.
 */
define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const MarketingMixin = require('views/mixins/marketing-mixin');
  const Template = require('stache!templates/sms_sent');

  function formatPhoneNumber (phoneNumber = '') {
    return phoneNumber.substr(0, 3) + '-' + phoneNumber.substr(3, 3) + '-' + phoneNumber.substr(6);
  }

  const View = BaseView.extend({
    template: Template,

    beforeRender () {
      if (! this.model.get('phoneNumber')) {
        this.navigate('send_sms');
        return false;
      }
    },

    context () {
      return {
        phoneNumber: formatPhoneNumber(this.model.get('phoneNumber'))
      };
    }
  });

  Cocktail.mixin(
    View,
    MarketingMixin
  );

  module.exports = View;
});

