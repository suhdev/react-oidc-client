import { UserManagerSettings, UserManager } from "oidc-client";

export let userManager: UserManager;

export function createUserManager(cfg: UserManagerSettings) {
  /** ensure that only a single instance exists during app execution */
  if (userManager) {
    return userManager;
  }
  return (userManager = new UserManager(cfg));
}

export async function forceRefreshUser() {
  let user;

  await userManager.removeUser();
  try {
    user = await userManager.signinSilent();
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    user = await userManager.signinPopup();
  }

  return user;
}

export function parseJwtToken(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function getIsExpiredFromJwt(token: string) {
  const parsedToken = parseJwtToken(token);
  return typeof parsedToken.exp !== "undefined"
    ? new Date(parsedToken.exp * 1000)
    : undefined;
}

export async function getUserSilently() {
  let user = await userManager.getUser();

  const expired =
    typeof user.expired === "undefined"
      ? getIsExpiredFromJwt(user.id_token || user.access_token)
      : user.expired;

  if (!user || expired) {
    user = null;
    await userManager.removeUser();
    try {
      user = await userManager.signinSilent();
    } catch (err) {
      console.log(err);
    }
  }

  if (!user) {
    user = await userManager.signinPopup();
  }

  return user;
}

export const getAppToken = async () => {
  if (!userManager) {
    throw new Error("User manager instance has not been initialised");
  }

  const user = await getUserSilently();

  if (!user || user.expired) {
    throw new Error("User is not logged in");
  }

  return user.access_token || user.id_token;
};

export const getUser = async () => {
  const user = await getUserSilently();

  if (!user || user.expired) {
    throw new Error("No user session");
  }

  return user;
};

export const logout = async () => {
  await userManager.signoutRedirect();
  /** keep waiting for redirection to happen */
  return new Promise(r => {});
};

export const login = async () => {
  await userManager.signinRedirect();

  /** keep waiting for redirection to happen */
  return new Promise(r => {});
};
