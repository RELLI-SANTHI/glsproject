export const environment = {
  SERVICE_API: {
    glsNetworkApi: 'https://api.gls-italy.com/structures',
    glsUserApi: 'https://api.gls-italy.com/users',
    glsAdministrativeApi: 'https://api.gls-italy.com/administratives',
    version: 'v1'
  },
  // GLS PROD
  login_azure: {
    clientId: 'b8201d59-c26f-4614-ac83-04ddc9d3e989',
    authority: 'https://login.microsoftonline.com/e6170c30-202d-4926-b525-b8b882873f3b/oauth2/token',
    redirectUri: 'https://eva.gls-italy.com/',
    ApplicationIDURI: 'api://f795f34c-5c68-4259-b3d8-c0740314c817/',
    beExposeApi: 'api-backend'
  },
  environment: 'prod'
};
