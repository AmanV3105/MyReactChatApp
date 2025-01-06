import React, { useEffect, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useRef } from "react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import useChatStore from "../../Firebase/ChatStore";
import useUserStore from "../../Firebase/Store";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const {chatId, user, isCurrentUserBlocked , isRecieverBlocked} = useChatStore();
  const endref = useRef(null);
  const {currentUser} = useUserStore();
  useEffect(() => {
    endref.current?.scrollIntoView({behavior : "smooth"})
  },[])
  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "chats", chatId ),
  (res)=>{
    setChat(res.data());
  }
);
    return () => {
      unSub();
    };
  }, [chatId]);
  const handlemoji = (e) => {
    setText((prev) => prev + e.emoji);
  };
  const handleSend = async () => {
    if (text.trim() === "") {
      return;
    }
    try {
      // Add the message to the chat document
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          createdAt: new Date(),
          text,
          senderId: currentUser.id,
        }),
      });
  
      const userIDs = [currentUser.id, user.id];
  
      // Update the lastMessage and updatedAt fields in userChats
      for (const id of userIDs) {
        const userChatRef = doc(db, "userChats", id);
  
        // Check if the userChats document exists
        const userChatsSnap = await getDoc(userChatRef);
        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();
          const existingChat = userChatsData.chats.find((chat) => chat.chatId === chatId);
  
          if (existingChat) {
            // Update existing chat data
            existingChat.lastMessage = text;
            existingChat.updatedAt = Date.now();
          } else {
            // Add new chat entry if it doesn't exist
            userChatsData.chats.push({
              chatId,
              lastMessage: text,
              receiverId: id === currentUser.id ? user.id : currentUser.id,
              updatedAt: Date.now(),
            });
          }
  
          // Save changes back to Firestore
          await updateDoc(userChatRef, { chats: userChatsData.chats });
        }
      }
  
      // Reset the input field
      setText("");
      console.log("Message sent successfully.");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  
  const emojiPickerRef = useRef(null);
  const handleClickOutside = (event) => {
    // Check if the click is outside the emoji picker
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  };
  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" />
          <div className="texts">
            <span>{user? user.username : "No User Yet"}</span>
            <p>Busy</p>
          </div>  
        </div>
        <div className="icons">
          <img src="./phone_1.png" />
          <img src="./video_1.png" />
          <img src="./info_1.png" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createAt}>
          <div className="texts">
          {message.img && <img src ={message.img} alt="" />}
            <p>
              {message.text}
            </p>
            {/* <span>1 min ago</span> */}
          </div>
        </div>))}
        <div ref = {endref}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./image_1.png" />
          <img src="./camera_1.png" />
          <img src="./mic_1.png" />
        </div>
        <input
          type="text"
          placeholder={isCurrentUserBlocked || isRecieverBlocked ? "You cannot Send Messages" : "Type a message"}
          onChange={(e) => setText(e.target.value)}
          value={text}
          disabled = {isCurrentUserBlocked || isRecieverBlocked}
        />
        <div className="emoji">
          <img src="./emoji_1.png" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker" ref={emojiPickerRef}>
            <EmojiPicker open={open} onEmojiClick={handlemoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled = {isCurrentUserBlocked || isRecieverBlocked}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
