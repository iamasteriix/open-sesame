export const USERCODE_PREFIX = 'oidc:user-code:';
export const UID_PREFIX = 'oidc:uid:';
export const GRANT_PREFIX = 'oidc:grant:';


export const GRANTABLE_MODEL_NAMES = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
]);