/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `signIn` view method

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const p = require('lib/promise');
  const VerificationMethods = require('lib/verification-methods');
  const VerificationReasons = require('lib/verification-reasons');

  module.exports = {
    /**
     * Sign in a user
     *
     * @param {Account} account - account being signed in to
     *   @param {String} account.sessionToken
     *   Session token from the account
     * @param {String} [password] - the user's password. Can be null if
     *  user is signing in with a sessionToken.
     * @param {Object} [options]
     *   @param {String} [options.unblockCode] - unblock code
     * @return {Object} promise
     */
    signIn (account, password, options = {}) {
      if (! account ||
            account.isDefault() ||
            (! account.has('sessionToken') && ! password)) {
        return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
      }

      return this.invokeBrokerMethod('beforeSignIn', account)
        .then(() => {
          // Always pass `signin` for viewName regardless of the actual view
          // because we want to log the real action that is being performed.
          // This is important for the infamous signin-from-signup feature.
          this.logFlowEvent('attempt', 'signin');

          return this.user.signInAccount(account, password, this.relier, {
            // a resume token is passed in to allow
            // unverified account or session users to complete
            // email verification.
            resume: this.getStringifiedResumeToken(account),
            unblockCode: options.unblockCode
          });
        })
        .then((account) => {
          if (this._formPrefill) {
            this._formPrefill.clear();
          }

          if (this.relier.accountNeedsPermissions(account)) {
            return this.navigate('signin_permissions', {
              account: account,
              // the permissions screen will call onSubmitComplete
              // with an updated account
              onSubmitComplete: this.onSignInSuccess.bind(this)
            });
          }

          return this.onSignInSuccess(account);
        })
        .fail((err) => {
          if (AuthErrors.is(err, 'THROTTLED') ||
              AuthErrors.is(err, 'REQUEST_BLOCKED')) {
            return this.onSignInBlocked(account, password, err);
          }

          // re-throw error, it'll be handled elsewhere.
          throw err;
        });
    },

    onSignInBlocked (account, password, err) {
      // signin is blocked and can be unblocked.
      if (err.verificationReason === VerificationReasons.SIGN_IN &&
          err.verificationMethod === VerificationMethods.EMAIL_CAPTCHA) {

        // Sending the unblock email could itself be rate limited.
        // If it is, the error should be displayed on this screen
        // and the user shouldn't even have the chance to continue.

        return account.sendUnblockEmail()
          .then(() => {
            return this.navigate('signin_unblock', {
              account: account,
              lastPage: this.currentPage,
              password: password
            });
          });
      }

      // Signin is blocked and cannot be unblocked, show the
      // error at another level.
      return p.reject(err);
    },

    onSignInSuccess (account) {
      if (! account.get('verified')) {
        var verificationMethod = account.get('verificationMethod');
        var verificationReason = account.get('verificationReason');

        if (verificationReason === VerificationReasons.SIGN_IN &&
            verificationMethod === VerificationMethods.EMAIL) {
          return this.navigate('confirm_signin', {
            account: account,
            flow: this.flow
          });
        } else {
          return this.navigate('confirm', {
            account: account,
            flow: this.flow
          });
        }
      }

      // If the account's uid changed, update the relier model or else
      // the user can end up in a permanent "Session Expired" state
      // when signing into Sync via force_auth. This occurs because
      // Sync opens force_auth with a uid. The uid could have changed. We
      // sign the user in here with the new uid, then attempt to do
      // other operations with the old uid. Not all brokers support
      // uid changes, so only make the update if the broker supports
      // the change. See #3057 and #3283
      if (account.get('uid') !== this.relier.get('uid') &&
          this.broker.hasCapability('allowUidChange')) {
        this.relier.set('uid', account.get('uid'));
      }

      // This is the generic signin.success metric. The one
      // true signin success metric.
      this.logEvent('signin.success');

      // This event is emitted whenever a user skips login
      // confirmation, whether it was required or not.
      this.logEvent('signin.success.skip-confirm');

      // This event ties the signin success to a screen.
      // Currently, can be oauth, signin, signup, signin-unblock
      this.logViewEvent('signin.success');

      var brokerMethod = this.afterSignInBrokerMethod || 'afterSignIn';
      var navigateData = this.afterSignInNavigateData || {};

      return this.invokeBrokerMethod(brokerMethod, account)
        .then(this.navigate.bind(this, this.model.get('redirectTo') || 'settings', {}, navigateData));
    }
  };
});
