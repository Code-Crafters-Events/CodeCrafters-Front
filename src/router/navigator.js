import { createContext, useContext } from "react";

let navigateFunction = null;

export const setNavigate = (nav) => {
  navigateFunction = nav;
};

export const navigateTo = (path) => {
  if (navigateFunction) navigateFunction(path);
  else window.location.href = path;
};

export const useNavigator = () => useContext({ navigate: navigateFunction });