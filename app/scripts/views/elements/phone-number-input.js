/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const textInput = require('views/elements/text-input');

  const element = Object.create(textInput);

  element.match = function ($el) {
    return $el.attr('type') === 'text' && $el.hasClass('phone-number');
  };

  element.val = function (val) {
    if (arguments.length === 1) {
      return this.__val(val);
    }

    return this.__val().replace(/[.-\s]/g, '');
  };

  element.validate = function () {
    const value = this.val();

    if (! value.length) {
      throw AuthErrors.toError('PHONE_NUMBER_REQUIRED');
    } else if (! /^\d+$/.test(value)) { // must be all digits
      throw AuthErrors.toError('INVALID_PHONE_NUMBER');
    } else if (value.length !== 10) { // must have a length of 10
      throw AuthErrors.toError('INVALID_PHONE_NUMBER');
    }
  };

  module.exports = element;
});
