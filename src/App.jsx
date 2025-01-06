import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase/Firebase";
import useUserStore from "./Firebase/Store"; // Zustand store
import useChatStore from "./Firebase/ChatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore(); // Zustand store
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user ID:", user.uid);
        fetchUserInfo(user.uid); // Fetch user info using Zustand action
      } else {
        console.log("No user is logged in.");
        fetchUserInfo(null); // Handle logged-out state
      }
    });

    return () => {
      unSub(); // Cleanup the listener on unmount
    };
  }, [fetchUserInfo]);

  if (isLoading) {
    return <div className="loading">Loading...</div>; // Show loading state
  }

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
