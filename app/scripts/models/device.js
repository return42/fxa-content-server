/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Device information
 */

define(function (require, exports, module) {
  'use strict';

  const Backbone = require('backbone');
  const Constants = require('lib/constants');

  var Device = Backbone.Model.extend({
    defaults: {
      clientType: Constants.CLIENT_TYPE_DEVICE,
      id: null,
      isCurrentDevice: null,
      isDevice: true,
      lastAccessTime: null,
      lastAccessTimeFormatted: null,
      // set the default name in case the name is blank
      name: 'Firefox',
      type: null
    },

    destroy () {
      // Both a sessionToken and deviceId are needed to destroy a device.
      // An account `has a` device, therefore account destroys the device.
      this.trigger('destroy', this);
    }
  });

  module.exports = Device;
});

