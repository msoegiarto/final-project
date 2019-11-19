import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Auth0Provider } from './contexts/react-auth0-context';
import { FTProvider } from './contexts/file-translation-context';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';
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
      redirect_uri={auth0.redirectUri}
      returnTo={auth0.returnTo}
      audience={auth0.audience}
      onRedirectCallback={onRedirectCallback}>
      <FTProvider>
        <App />
      </FTProvider>
    </Auth0Provider>
  </ThemeProvider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
