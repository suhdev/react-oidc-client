# react-oidc-client

The repository provides a declarative approach to working with `oidc-client`.
It wraps the different stages of the process in routes and handles everything behind the scenes.

Once authenticated, the children provided to the authentication components are rendered.

## Usage

### 1. Basic Example

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Authenticate } from "react-oidc-client";

const MySecretContent = () => <div>My secure content</div>;

ReactDOM.render(
  <Authenticate
    userManagerSettings={{
      loadUserInfo: true,
      userStore: new WebStorageStateStore({
        store: localStorage
      }),
      authority: "http://localhost:5000",
      client_id: "JAVASCRIPT_CLIENT_ID",
      redirect_uri: "http://localhost:3000/login_complete",
      response_type: "id_token token",
      response_mode: "fragment",
      scope: "openid profile", // add other scopes here
      post_logout_redirect_uri: "http://localhost:3000/logout"
    }}
  >
    <MySecretContent />
  </Authenticate>
);
```

### 2. Custom Login Complete and Logout Paths

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Authenticate } from "react-oidc-client";

const MySecretContent = () => <div>My secure content</div>;

ReactDOM.render(
  <Authenticate
    loginCompletePath="/my_login_complete_path"
    logoutPath="/my_logout_path"
    userManagerSettings={{
      loadUserInfo: true,
      userStore: new WebStorageStateStore({
        store: localStorage
      }),
      authority: "http://localhost:5000",
      client_id: "JAVASCRIPT_CLIENT_ID",
      redirect_uri: "http://localhost:3000/my_login_complete_path",
      response_type: "id_token token",
      response_mode: "fragment",
      scope: "openid profile", // add other scopes here
      post_logout_redirect_uri: "http://localhost:3000/my_logout_path"
    }}
  >
    <MySecretContent />
  </Authenticate>
);
```

### 3. Custom Loading Component

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Authenticate } from "react-oidc-client";

const MySecretContent:React.FC = () => <div>My secure content</div>;
const LoadingComponent:React.FC = ()=<div>My loader</div>

ReactDOM.render(
  <Authenticate
    LoadingComponent={LoadingComponent}
    loginCompletePath="/my_login_complete_path"
    logoutPath="/my_logout_path"
    userManagerSettings={{
      loadUserInfo: true,
      userStore: new WebStorageStateStore({
        store: localStorage
      }),
      authority: "http://localhost:5000",
      client_id: "JAVASCRIPT_CLIENT_ID",
      redirect_uri: "http://localhost:3000/my_login_complete_path",
      response_type: "id_token token",
      response_mode: "fragment",
      scope: "openid profile", // add other scopes here
      post_logout_redirect_uri: "http://localhost:3000/my_logout_path"
    }}
  >
    <MySecretContent />
  </Authenticate>
);
```

### 4. Access Loggedin User Info

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { Authenticate, useUserIdentity } from "react-oidc-client";

const MySecretContent:React.FC = () => {
  const user = useUserIdentity();
  return <div>{user.profile.name}</div>
};
const LoadingComponent:React.FC = ()=<div>My loader</div>

ReactDOM.render(
  <Authenticate
    LoadingComponent={LoadingComponent}
    loginCompletePath="/my_login_complete_path"
    logoutPath="/my_logout_path"
    userManagerSettings={{
      loadUserInfo: true,
      userStore: new WebStorageStateStore({
        store: localStorage
      }),
      authority: "http://localhost:5000",
      client_id: "JAVASCRIPT_CLIENT_ID",
      redirect_uri: "http://localhost:3000/my_login_complete_path",
      response_type: "id_token token",
      response_mode: "fragment",
      scope: "openid profile", // add other scopes here
      post_logout_redirect_uri: "http://localhost:3000/my_logout_path"
    }}
  >
    <MySecretContent />
  </Authenticate>
);
```
