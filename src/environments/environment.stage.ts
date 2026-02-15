export const environment = {
  SERVICE_API: {
    glsNetworkApi: 'https://api-stage.gls-italy.com/structures',
    glsUserApi: 'https://api-stage.gls-italy.com/users',
    glsAdministrativeApi: 'https://api-stage.gls-italy.com/administratives',
    version: 'v1'
  },

  // GLS STAGE
  login_azure: {
    clientId: 'a151597c-5375-49d8-9fc8-ccf28b855c2b', // Application (client) ID
    authority: 'https://login.microsoftonline.com/e6170c30-202d-4926-b525-b8b882873f3b/oauth2/token', // OAuth 2.0 token endpoint (v1)
    redirectUri: 'https://eva-stage.gls-italy.com/',
    ApplicationIDURI: 'api://935940df-eb86-497c-b145-eeba018dbf8a/',
    beExposeApi: 'api-backend'
  },
  environment: 'stage'
};
