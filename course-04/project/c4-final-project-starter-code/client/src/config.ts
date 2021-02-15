// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '3ea6ym6l3l'
const region = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-birnqkz4.eu.auth0.com',            // Auth0 domain
  clientId: 'Rz2YL8VA0sgAi5H6qgB83tSmQXwycTvC',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
