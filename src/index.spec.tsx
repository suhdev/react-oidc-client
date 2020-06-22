import React from "react";
import { UserManager, User } from "oidc-client";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Authenticate } from "./authenticate";
import { useUserIdentity } from "./context";

describe("molecules/authentication", () => {
  afterEach(cleanup);

  const userIdentity: User = ({
    access_token: "some_access_token",
    expired: false,
    expires_at: +new Date(Date.now() + 1000000) / 1000,
    expires_in: 100000,
    id_token: "some_access_token",
    profile: {
      sub: "123",
      name: "User name",
      email: "example@gmail.com"
    } as any
  } as unknown) as User;

  const renderComponent = (children: React.ReactNode, entries?: string[]) =>
    render(
      <MemoryRouter
        initialEntries={entries}
        initialIndex={entries ? 0 : undefined}
      >
        {children}
      </MemoryRouter>
    );

  const createManager: () => UserManager = () =>
    (({
      clearStaleState: jest.fn(),
      createSigninRequest: jest.fn(),
      createSignoutRequest: jest.fn(),
      getUser: jest.fn(() => Promise.resolve(userIdentity)),
      removeUser: jest.fn(),
      revokeAccessToken: jest.fn(),
      signinCallback: jest.fn(),
      signinRedirect: jest.fn(),
      signinSilent: jest.fn(),
      signinSilentCallback: jest.fn(),
      storeUser: jest.fn(),
      signoutRedirect: jest.fn()
    } as unknown) as UserManager);
  describe("AuthenticatedAppWrapper", () => {
    it("should render authenticated route if user identity exists", async () => {
      const manager = createManager();

      const { getByTestId } = renderComponent(
        <Authenticate userManagerSettings={{}} userManager={manager}>
          <div data-testid="authenticated">authenticated content</div>
        </Authenticate>
      );

      await new Promise(r => setTimeout(r, 50));

      expect(getByTestId("authenticated")).toBeDefined();
    });

    it("should redirect to login page", async () => {
      const manager = createManager();

      manager.getUser = jest.fn(() => Promise.resolve(null));
      manager.signinRedirect = jest.fn(() => new Promise(r => {}));

      renderComponent(
        <Authenticate userManagerSettings={{}} userManager={manager}>
          <div data-testid="authenticated">authenticated content</div>
        </Authenticate>
      );

      await new Promise(r => setTimeout(r, 50));

      expect(manager.signinRedirect).toHaveBeenCalled();
    });

    it("should handle login complete", async () => {
      const manager = createManager();

      manager.getUser = jest.fn(() => Promise.resolve(null));
      manager.signinCallback = jest.fn(() => Promise.resolve(userIdentity));

      renderComponent(
        <Authenticate userManagerSettings={{}} userManager={manager}>
          <div data-testid="authenticated">authenticated content</div>
        </Authenticate>,
        ["/login_complete"]
      );

      await new Promise(r => setTimeout(r, 50));

      expect(manager.signinCallback).toHaveBeenCalled();
    });

    it("should clear user state upon logout", async () => {
      const manager = createManager();

      manager.getUser = jest.fn(() => Promise.resolve(null));
      manager.signinRedirectCallback = jest.fn(() =>
        Promise.resolve(userIdentity)
      );

      renderComponent(
        <Authenticate userManagerSettings={{}} userManager={manager}>
          <div data-testid="authenticated">authenticated content</div>
        </Authenticate>,
        ["/logout"]
      );

      await new Promise(r => setTimeout(r, 50));

      expect(manager.clearStaleState).toHaveBeenCalled();
      expect(manager.revokeAccessToken).toHaveBeenCalled();
      expect(manager.removeUser).toHaveBeenCalled();
    });
  });

  describe("useUserIdentity", () => {
    it("should have access to logged in user identity", async () => {
      const manager = createManager();

      const Component = () => {
        const user = useUserIdentity();

        return <div data-testid="authenticated">{user.profile.email}</div>;
      };

      const { getByTestId } = renderComponent(
        <Authenticate userManagerSettings={{}} userManager={manager}>
          <Component />
        </Authenticate>,
        ["/logout"]
      );

      await new Promise(r => setTimeout(r, 50));

      expect(getByTestId("authenticated").textContent).toEqual(
        userIdentity.profile.email
      );
    });
  });
});
