import '../sass/main.scss';
import play from './main';
//import app from './main';
// app();
jQuery(document).ready(function () {

  // authentication/registration
  var config = {
    // Enable or disable widget functionality with the following options. Some of these features require additional configuration in your Okta admin settings. Detailed information can be found here: https://github.com/okta/okta-signin-widget#okta-sign-in-widget
    // Look and feel changes:
    logo: '//logo.clearbit.com/okta.com', // Try changing "okta.com" to other domains, like: "workday.com", "splunk.com", or "delmonte.com"
    language: 'en',                       // Try: [fr, de, es, ja, zh-CN] Full list: https://github.com/okta/okta-signin-widget#language-and-text
    i18n: {
      //Overrides default text when using English. Override other languages by adding additional sections.
      'en': {
        'primaryauth.title': 'Sign In',   // Changes the sign in text
        'primaryauth.submit': 'Sign In',  // Changes the sign in button
      }
    },
    // Changes to widget functionality
    features: {
      registration: true,                 // Enable self-service registration flow
      rememberMe: true,                   // Setting to false will remove the checkbox to save username
      router: true,                       // Leave this set to true for the API demo
    },
    baseUrl: "https://dev-575577.okta.com",
    clientId: "0oau8wv7qDR3e6jff356",
    authParams: {
      issuer: "https://dev-575577.okta.com/oauth2/default",
      responseType: ['token', 'id_token'],
      display: 'page'
    }
  };

  var oktaSignIn = new OktaSignIn(config);
  if (oktaSignIn.token.hasTokensInUrl()) {
    oktaSignIn.token.parseTokensFromUrl(
      // If we get here, the user just logged in.
      function success(res) {
        var accessToken = res[0];
        var idToken = res[1]

        oktaSignIn.tokenManager.add('accessToken', accessToken);
        oktaSignIn.tokenManager.add('idToken', idToken);

        window.location.hash = '';
        console.log("Hello, " + idToken.claims.email + "! You just logged in! :)");
        play();
      },
      function error(err) {
        console.error(err);
      }
    );
  } else {
    oktaSignIn.session.get(function (res) {
      // If we get here, the user is already signed in.
      if (res.status === 'ACTIVE') {
        console.log("Hello, " + res.login + "! You are *still* logged in! :)");
        play();
        return;
      }
      oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        function success(res) { },
        function error(err) {
          console.error(err);
        }
      );
    });
  }

  function logout() {
    oktaSignIn.signOut('/');
      // redirect to login page
    self.location = '/';
    oktaSignIn = new OktaSignIn(config);
  }

  // logout by ESC, later will change
  document.addEventListener('keyup', e => {
    if (e.keyCode == 27) logout();
  })


});
