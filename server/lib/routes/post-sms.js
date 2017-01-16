/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to send SMS messages
 */

module.exports = function (config) {
  var sendSms = require('../sms-client')(config);

  return {
    method: 'post',
    path: '/sms',
    process: function (req, res) {
      var message = 'Here is your magic Firefox download link: https://fxa.test-app.link/';//firefox://?connectSync=true';
      //`?url=https://accounts.firefox.com?email=${this.model.get('email')}`
      var to = req.body.to;

      sendSms(to, message)
        .then(function (data) {
          res.status(200).json({});
        }, function (err) {
          res.status(500).json({ error: err.message });
        });
    }
  };
};
