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

export async function getUserSilently() {
  let user = await userManager.getUser();

  if (!user || user.expired) {
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

  return user.access_token;
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
