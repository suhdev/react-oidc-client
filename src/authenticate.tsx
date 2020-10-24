import { UserManager, UserManagerSettings, User } from "oidc-client";
import Async from "react-async";
import React, { useCallback, useState } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { createUserManager, setUserManager } from "./constants";
import { AuthenticationProvider } from "./context";

const REDIRECT_URL_KEY = "REDIRECT_URL";

const LoginComplete: React.FC<{
  manager: UserManager;
  LoadingComponent: React.FC;
}> = ({ manager, LoadingComponent }) => {
  const redirectTo = localStorage.getItem(REDIRECT_URL_KEY) || "/";
  const completeLogin = useCallback(async () => {
    const user = await manager.signinCallback();

    if (!user) {
      throw new Error("login failed");
    }
    await manager.storeUser(user);
    return user;
  }, [manager]);

  return (
    <Async promiseFn={completeLogin}>
      <Async.Loading>
        <LoadingComponent />
      </Async.Loading>
      <Async.Resolved>
        <Redirect to={redirectTo} />
      </Async.Resolved>
      <Async.Rejected>
        <Logout manager={manager} />
      </Async.Rejected>
    </Async>
  );
};

const Logout: React.FC<{ manager: UserManager }> = ({ manager }) => {
  const loginFailed = useCallback(async () => {
    await manager.clearStaleState();
    await manager.revokeAccessToken();
    await manager.removeUser();
  }, [manager]);

  return (
    <Async promiseFn={loginFailed}>
      <Async.Settled>
        <Redirect to="/" />
      </Async.Settled>
    </Async>
  );
};

const RedirectToLogin: React.FC<{
  manager: UserManager;
  LoadingComponent: React.FC;
}> = ({ manager, LoadingComponent }) => {
  const redirect = useCallback(async () => {
    await manager.clearStaleState();
    await manager.removeUser();
    await manager.revokeAccessToken();
    await manager.signinRedirect();
    return new Promise(r => {});
  }, [manager]);
  return (
    <Async promiseFn={redirect}>
      <Async.Initial>
        <LoadingComponent />
      </Async.Initial>
      <Async.Loading>
        <LoadingComponent />
      </Async.Loading>
    </Async>
  );
};

const AuthenticateInner: React.FC<{
  manager: UserManager;
  LoadingComponent: React.FC;
  basename?: string;
}> = ({ manager, basename, children, LoadingComponent }) => {
  const login = useCallback(async () => {
    localStorage.setItem(
      REDIRECT_URL_KEY,
      basename
        ? window.location.href.replace(basename, "")
        : window.location.pathname
    );
    const user = await manager.getUser();

    if (!user || user.expired) {
      await manager.removeUser();
      throw new Error("No user account");
    }

    return user;
  }, [manager]);

  return (
    <Async promiseFn={login} key="user">
      <Async.Resolved<User>>
        {user => (
          <AuthenticationProvider user={user}>
            {children}
          </AuthenticationProvider>
        )}
      </Async.Resolved>
      <Async.Loading>
        <LoadingComponent />
      </Async.Loading>
      <Async.Rejected>
        <RedirectToLogin
          manager={manager}
          LoadingComponent={LoadingComponent}
        />
      </Async.Rejected>
    </Async>
  );
};

const Loading: React.FC = () => <div>Loading...</div>;

export const Authenticate: React.FC<{
  userManager?: UserManager;
  userManagerSettings: UserManagerSettings;
  loginCompletePath?: string;
  basename?: string;
  logoutPath?: string;
  LoadingComponent?: React.FC;
}> = ({
  basename,
  children,
  userManager,
  userManagerSettings,
  LoadingComponent = Loading,
  loginCompletePath = "/login_complete",
  logoutPath = "/logout"
}) => {
  const [mgr] = useState(
    () => userManager || createUserManager(userManagerSettings)
  );

  if (userManager) {
    setUserManager(userManager);
  }

  return (
    <Switch>
      <Route path={loginCompletePath}>
        <LoginComplete manager={mgr} LoadingComponent={LoadingComponent} />
      </Route>
      <Route path={logoutPath}>
        <Logout manager={mgr} />
      </Route>
      <Route path="/">
        <AuthenticateInner
          manager={mgr}
          basename={basename}
          LoadingComponent={LoadingComponent}
        >
          {children}
        </AuthenticateInner>
      </Route>
    </Switch>
  );
};
