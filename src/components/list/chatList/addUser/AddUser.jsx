import React, { useState } from "react";
import "./addUser.css";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../../Firebase/Firebase";
import useUserStore from "../../../../Firebase/Store";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      console.log("Searching for username:", username);
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No matching user found.");
        setUser(null);
        return;
      }

      const foundUser = querySnapshot.docs[0].data();
      setUser(foundUser);
    } catch (err) {
      console.error("Error searching for user:", err);
    }
  };

  const handleAddUser = async () => {
    try {
      // Check if the chat already exists
      const userChatsRef = doc(db, "userChats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);
      if (userChatsSnap.exists()) {
        const userChats = userChatsSnap.data().chats || [];
        const existingChat = userChats.find((chat) => chat.receiverId === user.id);

        if (existingChat) {
          console.log("Chat with this user already exists.");
          return;
        }
      }

      // Create a new chat document
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update current user's chats
      await setDoc(
        userChatsRef,
        {
          chats: arrayUnion({
            chatId: chatRef.id,
            lastMessage: "",
            receiverId: user.id,
            updatedAt: Date.now(),
          }),
        },
        { merge: true }
      );

      // Update added user's chats
      await setDoc(
        doc(db, "userChats", user.id),
        {
          chats: arrayUnion({
            chatId: chatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        },
        { merge: true }
      );

      console.log("User added successfully.");
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.userImage || "./avatar.png"} alt="User Avatar" />
            <span style={{ color: "white" }}>{user.username}</span>
          </div>
          <button onClick={handleAddUser}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
