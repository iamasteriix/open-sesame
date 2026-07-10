# Open Sesame - Server

```
# register client
curl -sX POST http://localhost:5000/clients/register -H "Content-Type: application/json" -d '{ "name": "Napier", "logo_url": "api.dicebear.com/10.x/icons/svg?seed=zwz855an", "redirect_uris": ["http://localhost:1000/callback"], "allowed_grants": ["authorization_code", "refresh_token"], "allowed_scopes": ["openid", "profile", "email"], "is_public": false }' | jq

# patch client
curl -sX PATCH http://localhost:5000/clients/019f4637-4fcf-792d-8419-99fd9c936788 -H "Content-Type: application/json" -d '{ "name": "Greenleaf", "redirect_uris_diff": { "add": ["http://localhost:1001"] }, "allowed_grants_diff": { "add": ["client_credentials"], "remove": ["implicit"] }, "allowed_scopes_diff": { "remove": ["profile"] }, "is_public_diff": { "incoming": false, "current": true } }' | jq

# revoke client
curl -sX POST http://localhost:5000/clients/<id>/revoke -H "Content-Type: application/json" | jq
```