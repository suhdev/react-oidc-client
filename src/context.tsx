import React, { useContext } from "react";
import { User } from "oidc-client";

const AuthenticationContext = React.createContext<User>(null as any);

export const AuthenticationProvider: React.FC<{ user: User }> = ({
  user,
  children,
}) => {
  return (
    <AuthenticationContext.Provider value={user}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useUserIdentity = () => {
  return useContext(AuthenticationContext);
};
