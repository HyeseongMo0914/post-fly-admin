import { atom } from "jotai";

export interface AuthState {
  isLoggedIn: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  isLoading: boolean;
  isChecked: boolean;
}

export const authAtom = atom<AuthState>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  isChecked: false,
});

export const checkAuthAtom = atom(null, async (get, set) => {
  const currentAuth = get(authAtom);

  if (currentAuth.isChecked) {
    return;
  }

  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();

    if (data.ok) {
      set(authAtom, {
        isLoggedIn: true,
        user: data.user || null,
        isLoading: false,
        isChecked: true,
      });
    } else {
      set(authAtom, {
        isLoggedIn: false,
        user: null,
        isLoading: false,
        isChecked: true,
      });
    }
  } catch {
    set(authAtom, {
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isChecked: true,
    });
  }
});

export const logoutAtom = atom(null, async (get, set) => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    set(authAtom, {
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isChecked: true,
    });
  } catch (error) {
    console.error("로그아웃 실패:", error);
  }
});

export const loginAtom = atom(
  null,
  async (get, set, userData: { user: AuthState["user"] }) => {
    set(authAtom, {
      isLoggedIn: true,
      user: userData.user || null,
      isLoading: false,
      isChecked: true,
    });
  }
);
