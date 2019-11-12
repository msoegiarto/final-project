import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';
import { Auth0Provider } from './auth0/react-auth0-wrapper';
// import config from './auth0/auth_config.json';
import config from './config';

const { auth0 } = config;

// A function that routes the user to the right place after login
const onRedirectCallback = appState => {
  window.history.replaceState(
    {},
    document.title,
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Auth0Provider
      domain={auth0.domain}
      client_id={auth0.clientId}
      redirect_uri={window.location.origin}
      audience={auth0.audience}
      onRedirectCallback={onRedirectCallback}>
      <App />
    </Auth0Provider>
  </ThemeProvider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
