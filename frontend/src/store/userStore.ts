import { atom } from 'nanostores';

export type UserState = {
  username: string | null;
  isAuthenticated: boolean;
};

// 1. Al cargar la página, buscamos si ya había una sesión guardada en el navegador
const getInitialState = (): UserState => {
  // Verificamos 'window' porque Astro compila cosas en el servidor donde no hay navegador
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('userSession');
    if (stored) return JSON.parse(stored);
  }
  return { username: null, isAuthenticated: false };
};

export const $user = atom<UserState>(getInitialState());

// 2. Cada vez que el estado cambia (login, update, logout), actualizamos el almacenamiento local
$user.listen((newState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userSession', JSON.stringify(newState));
  }
});

export const loginUser = (username: string) => {
  $user.set({ username, isAuthenticated: true });
};

export const updateUsername = (newUsername: string) => {
  $user.set({ username: newUsername, isAuthenticated: true });
};

export const logoutUser = () => {
  $user.set({ username: null, isAuthenticated: false });
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userSession'); // Destruimos la sesión por seguridad
    window.location.href = '/';
  }
};