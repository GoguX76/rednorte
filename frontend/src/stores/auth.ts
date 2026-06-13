import { atom } from 'nanostores';

export type User = {
  id: string;
  email: string;
  role_id: string;
};

export const $token = atom<string | null>(null);
export const $user = atom<User | null>(null);

export function login(token: string, user: User): void {
  $token.set(token);
  $user.set(user);
}

export function logout(): void {
  $token.set(null);
  $user.set(null);
}

export function initAuth(): void {
  if (typeof localStorage === 'undefined') return;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    $token.set(token);
    $user.set(JSON.parse(user));
  }
}
