export default {
  MAX_ATTACHMENT_SIZE: 100000,
  auth0: {
    clientId: process.env.REACT_APP_AUTH0_CLIENTID,
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
    return_to: process.env.REACT_APP_AUTH0_RETURN_TO
  },
};