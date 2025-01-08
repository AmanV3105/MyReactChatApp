import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";
import { use } from "react";
import useUserStore from "./Store";

const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isRecieverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // checking if currentuser is blocked by receiver
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isRecieverBlocked: false,
      });
    }

    // Check if receiver is blocked by current user
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: false,
        isRecieverBlocked: true,
      });
    }
    else{
        return set({
          chatId,
          user,
          isCurrentUserBlocked: false,
          isRecieverBlocked: false,
        });
    }

  },
  changeBlock: () => {
    set(state => ({ ...state, isRecieverBlocked: !state.isRecieverBlocked }));
  },
  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
}));
export default useChatStore;
