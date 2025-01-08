import React, { useEffect, useState } from "react";
import "./chatList.css";
import SearchIcon from "@mui/icons-material/Search";
import AddUser from "./addUser/AddUser";
import useUserStore from "../../../Firebase/Store";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../Firebase/Firebase";
import useChatStore from "../../../Firebase/ChatStore";

const ChatList = () => {
  const [addMode, setMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unsub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        if (!res.exists()) {
          setChats([]);
          return;
        }

        const items = res.data().chats || [];
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChatsRef = doc(db, "userChats", currentUser.id);
    try {
      const userChatsSnap = await getDoc(userChatsRef);
      if (userChatsSnap.exists()) {
        const userChats = userChatsSnap.data().chats || [];
        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        if (chatIndex !== -1) {
          userChats[chatIndex].isSeen = true; // Mark as seen for current user
          await updateDoc(userChatsRef, { chats: userChats });
        }
      }
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.error("Error updating seen status:", error);
    }
  };
  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));
  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <SearchIcon />
          <input type="text" placeholder="Search or start new chat" onChange={(e)=>{setInput(e.target.value)}}/>
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          className="add"
          onClick={() => setMode((prev) => !prev)}
          alt="Toggle Add Mode"
        />
      </div>
      {chats.length === 0 && !addMode && (
        <div className="noChats">
          <p>No chats available. Start a new chat to see it here.</p>
        </div>
      )}
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          // style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe"}}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.userImage || "./avatar.png"
            }
            alt="User Avatar"
          />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}</span>
            <p>
              {chat.lastMessage || "No messages yet"}{" "}
              {/* {chat.isSeen ? (
                <span className="blueTick">✔✔</span> // Double blue tick
              ) : (
                <span className="greyTick">✔</span> // Single grey tick
              )} */}
            </p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
