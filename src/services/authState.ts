// Gestionnaire d'état auth global simple
type AuthListener = (user: any) => void;
let currentUser: any = null;
const listeners: AuthListener[] = [];

export const authState = {
  getUser: () => currentUser,
  setUser: (user: any) => {
    currentUser = user;
    listeners.forEach(l => l(user));
  },
  subscribe: (listener: AuthListener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },
};
