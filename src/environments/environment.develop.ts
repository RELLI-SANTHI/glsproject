export const environment = {
  SERVICE_API: {
    glsNetworkApi: 'https://apim-glsit-eva-dev-germanywestcentral-001.azure-api.net/structures',
    glsUserApi: 'https://apim-glsit-eva-dev-germanywestcentral-001.azure-api.net/users',
    glsAdministrativeApi: 'https://apim-glsit-eva-dev-germanywestcentral-001.azure-api.net/administratives',
    version: 'v1'
  },

  // GLS DEV
  login_azure: {
    clientId: 'f3a05d89-fd1e-41fd-b16b-219462425da5', // Application (client) ID
    authority: 'https://login.microsoftonline.com/e6170c30-202d-4926-b525-b8b882873f3b/oauth2/token', // OAuth 2.0 token endpoint (v1)
    redirectUri: 'https://eva-dev.gls-italy.com',
    ApplicationIDURI: 'api://0052cf13-3bcf-41e8-90d0-f8d8d1f1dee1/',
    beExposeApi: 'api-backend'
  },
  environment: 'development'
};
