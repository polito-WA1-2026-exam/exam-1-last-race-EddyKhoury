//who is logged in
//whether the user is logged in or anonymous
//gihow to update the user after login/logout

import { createContext } from "react";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  loggedIn: false,
  setLoggedIn: () => {}
});

export default UserContext;