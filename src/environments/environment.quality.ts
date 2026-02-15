export const environment = {
  SERVICE_API: {
    glsNetworkApi: 'https://api-qa.gls-italy.com/structures',
    glsUserApi: 'https://api-qa.gls-italy.com/users',
    glsAdministrativeApi: 'https://api-qa.gls-italy.com/administratives',
    version: 'v1'
  },
  // GLS QA
  login_azure: {
    clientId: '3a410f10-8b2f-4b18-ae6b-09ab6db200a0',
    authority: 'https://login.microsoftonline.com/e6170c30-202d-4926-b525-b8b882873f3b/oauth2/token',
    redirectUri: 'https://eva-qa.gls-italy.com/',
    ApplicationIDURI: 'api://fb11cd3e-5d8f-4965-8838-9944bab802a4/',
    beExposeApi: 'Backend.Default'
  },
  environment: 'quality'
};
