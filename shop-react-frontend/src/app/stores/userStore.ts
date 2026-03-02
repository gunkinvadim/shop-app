import { create } from 'zustand';
import { UserData } from '../models/auth.models';

type UserState = {
  userData: UserData | null;
  setUserData: (u: UserData | null) => void;
  clearUserData: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  userData: null,
  setUserData: (u) => set({ userData: u }),
  clearUserData: () => set({ userData: null })
}));

export default useUserStore;
