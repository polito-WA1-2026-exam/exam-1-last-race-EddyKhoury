//who is logged in
//whether the user is logged in or anonymous
//gihow to update the user after login/logout

import { createContext } from "react";

//it creates a global react context for authentication state
const UserContext = createContext({
  user: null,
  setUser: () => {},
  loggedIn: false,
  setLoggedIn: () => {}
});
//Without UserContext we would need to pass user/loggedIn/setUser/setLoggedIn manually
export default UserContext;