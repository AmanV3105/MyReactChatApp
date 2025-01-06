import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";

const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        set({ currentUser: docSnap.data(), isLoading: false });
      }else{
        console.log("No such document!");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log(err.message);
      return set({ currentUser: null, isLoading: false });
    }
  },
}));

export default useUserStore;
