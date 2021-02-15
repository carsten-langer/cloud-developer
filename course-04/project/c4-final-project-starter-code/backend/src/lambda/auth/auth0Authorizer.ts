import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import {verify} from 'jsonwebtoken'
import {createLogger} from '../../utils/logger'
//import Axios from 'axios'
import {JwtPayload} from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

// As this is optional, I'll not do it, but rather hard-code the certificate.
//const jwksUrl = '...'
const cert = '-----BEGIN CERTIFICATE-----\n' +
    'MIIDDTCCAfWgAwIBAgIJVDUAvLTh0pEVMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV\n' +
    'BAMTGWRldi1iaXJucWt6NC5ldS5hdXRoMC5jb20wHhcNMjEwMjE0MTYwNTAwWhcN\n' +
    'MzQxMDI0MTYwNTAwWjAkMSIwIAYDVQQDExlkZXYtYmlybnFrejQuZXUuYXV0aDAu\n' +
    'Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA16aaK04YJgxyTf/l\n' +
    '8T7L5Qw0eDGIDub0vdxv4hWWmyqu9vQvIAu5SbkUvI0DpViWnX4Nk2Vb3sIH7T/O\n' +
    'vKA2siZhslsKtbxAHEwX1xkhPEd/6dqwCVtQmVmj3QFCN3ZMVzw6kBUboQYFlzz0\n' +
    'evWMiD8b8H/4NUN0Els0FC5nSqBipGphdW2oc/1xWOBdJuIpnzOcgon7g0rJ0Jjj\n' +
    'B96bMLTPSoq6lvHS01lbTRMmzlPIe9zOiBnFeoHVbj5XXCR4Eb8URBtEceBAgS10\n' +
    'dYVf2L8KXSDxBFeMOnyd/SJYpdqXmXxN3K44hYcpH704nOTO4MTqlQXq0dsufybX\n' +
    'N6KhQQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTXY9mISOjN\n' +
    'FED7zCAGl7r/R34lyDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB\n' +
    'AABPYJVVU31Qeb6l6T1XaPcXTpYyCMHLh4Bu0fRZqSR4c8GP6vi1UnrnSEmn1JTQ\n' +
    'g34nK62zkmtMk9C47KEYvwwnCwYxk4ckWm4ZJK3NgE8rUtDL/Qn62Xi16G0Nc4ML\n' +
    'hEQfxXq2YEox0Qv84EMq+aEI5rx2BoAjRGt17Mf1Ki55u29TLb14BMyx+B6max7L\n' +
    'ATLnk9vQD7voU/G+iHI613sitVX3/hr8pi1RfhYd0yTqIP9Wxz8QW3QL8bHlss5y\n' +
    'J6ZSyoOVmHr1mNJiB8YwPPLtCenBbP7Qo6qdAJsoLO1f2+t4hdGfsG9wt/8e55Au\n' +
    '/BX13lbJxLx6pbBuHZSWGjE=\n' +
    '-----END CERTIFICATE-----'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
//  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  return split[1]
}
