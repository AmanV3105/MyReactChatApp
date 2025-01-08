import React, { useEffect, useState, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import useChatStore from "../../Firebase/ChatStore";
import useUserStore from "../../Firebase/Store";
import UploadFile from "../../Firebase/Uploadfile";
import { toast } from "react-toastify";


const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [file, setFile] = useState(null); // For handling file uploads (images or applications)
  const { chatId, user, isCurrentUserBlocked, isRecieverBlocked } = useChatStore();
  const endref = useRef(null);
  const { currentUser } = useUserStore();

  useEffect(() => {
    endref.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmojiClick = (e) => {
    setText((prev) => prev + e.emoji);
    // setOpen(false);
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return; // Do not send if both text and file are empty

    let fileUrl = null;
    let fileName = null;
    const isImage = file && file.type.startsWith("image/");

    try {
      if (file) {
        fileUrl = await UploadFile(file); // Upload file (image or application)
        fileName = file.name; // Store file name
        setFile(null); // Reset file input
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          createdAt: new Date(),
          text: text || "", // Send text if available
          senderId: currentUser.id,
          ...(isImage && { image: fileUrl }), // Include image URL if uploaded
          ...(!isImage && fileUrl && { application: { url: fileUrl, name: fileName } }), // Include application details if uploaded
        }),
      });

      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatRef = doc(db, "userChats", id);
        const userChatsSnap = await getDoc(userChatRef);

        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();
          const existingChat = userChatsData.chats.find((chat) => chat.chatId === chatId);

          if (existingChat) {
            existingChat.lastMessage = text || (isImage ? "Image" : "File"); // Use "Image" or "File" if no text
            existingChat.updatedAt = Date.now();
          } else {
            userChatsData.chats.push({
              chatId,
              lastMessage: text || (isImage ? "Image" : "File"),
              receiverId: id === currentUser.id ? user.id : currentUser.id,
              updatedAt: Date.now(),
            });
          }

          await updateDoc(userChatRef, { chats: userChatsData.chats });
        }
      }

      // Reset input fields after sending
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send the message.");
    }
  };

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Store the selected file
      toast.success("File is ready to send. Click the send button.");
    }
  };

  const emojiPickerRef = useRef(null);
  const handleClickOutside = (event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now"; // Less than 1 min
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`; // Less than 1 hr
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`; // Less than 1 day
    return `${Math.floor(diff / 86400000)} day${Math.floor(diff / 86400000) > 1 ? "s" : ""} ago`; // More than 1 day
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.userImage || "./avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{user ? user.username : "No User Yet"}</span>
            <p>Busy</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone_1.png" alt="Phone" />
          <img src="./video_1.png" alt="Video" />
          <img src="./info_1.png" alt="Info" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={message.senderId === currentUser?.id ? "message own" : "message"}
            key={`${message.createdAt}_${index}`} // Unique key
          >
            <div className="texts">
              {message.image && <img src={message.image} alt="Message Attachment" />}
              {message.application && (
                <div style = {{backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "5px", display: "inline-block"}}>
                  <a
                    href={message.application.url}
                    download={message.application.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {message.application.name}
                  </a>
                </div>
              )}
              {message.text && <p>{message.text}</p>}
              
              <span>{formatTimestamp(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endref}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./attach-file1.png" alt="File Upload" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleFile} />
          <img src="./camera_1.png" alt="Camera" />
          <img src="./mic_1.png" alt="Mic" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isRecieverBlocked
              ? "You cannot Send Messages"
              : "Type a message"
          }
          onChange={(e) => setText(e.target.value)}
          value={text}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        />
        <div className="emoji">
          <img src="./emoji_1.png" alt="Emoji Picker" onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isRecieverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
