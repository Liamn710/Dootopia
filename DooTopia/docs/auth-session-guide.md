# Web session auth guide

This backend issues an httpOnly `session` cookie using Firebase Admin session cookies. Use this guide to log in, persist across refreshes, and log out from a web client.

## Backend env

- Set the frontend origin so cookies/credentials are allowed:

```
CORS_ORIGIN="http://localhost:19006"
```

- If frontend and backend are on different sites over HTTPS, enable cross-site cookies:

```
CROSS_SITE_COOKIES="true"
```

Restart the server after changing env.

## Browser login flow (axios)

```ts
import axios from 'axios';

async function loginWithIdToken(idToken: string) {
  // Create and set CSRF cookie (double-submit pattern)
  const csrfToken = Math.random().toString(36).slice(2);
  document.cookie = `csrfToken=${csrfToken}; path=/`;

  await axios.post(
    'http://localhost:3000/sessionLogin',
    { idToken, csrfToken },
    { withCredentials: true }
  );
}
```

## Check session on app load

```ts
import axios from 'axios';

async function fetchMe() {
  const res = await axios.get('http://localhost:3000/me', { withCredentials: true });
  return res.data.user; // { uid, email, ... }
}
```

## Logout

```ts
import axios from 'axios';

async function logout() {
  await axios.post('http://localhost:3000/sessionLogout', {}, { withCredentials: true });
}
```

Notes:
- httpOnly cookie cannot be read by JS; always call `/me` to hydrate auth state.
- For cross-site over HTTPS, the server will automatically set `SameSite=None; Secure` when `CROSS_SITE_COOKIES=true`.
- For React Native (non-web), prefer bearer tokens or use a cookie manager library.
