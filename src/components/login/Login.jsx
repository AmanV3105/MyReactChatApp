import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";

import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../Firebase/Firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import Uploadfile from "../../Firebase/Uploadfile";

const Login = () => {
  const [userImage, setUserImage] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  };
  const handleUserImage = (e) => {
    const file = e.target.files[0];
    setUserImage({ file: file, url: URL.createObjectURL(file) });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const { Email, password } = data;

    try {
      await signInWithEmailAndPassword(auth, Email, password);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const { username, Email, password } = data;
    if (!username || !Email || !password)
      return toast.warn("Please enter inputs!");
    if (!userImage.file) return toast.warn("Please upload an avatar!");
    // VALIDATING UNIQUE USERNAME
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Select another username");
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, Email, password);
      console.log("User created:", res.user.uid);

      const imageURL = await Uploadfile(userImage.file);
      console.log("Image URL:", imageURL);

      await setDoc(doc(db, "users", res.user.uid), {
        username: username,
        email: Email,
        userImage: imageURL,
        id: res.user.uid,
        blocked: [],
      });
      console.log("User data saved to Firestore");

      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });
      console.log("User chats initialized in Firestore");

      toast.success("Your Account is Created! You can Login Now");
    } catch (err) {
      console.error("Error in handleRegister:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login">
      <div className="heading">
        <h1>React Chat</h1>
      </div>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Email" name="Email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            Upload an image
            <img src={userImage.url || "./avatar.png"} alt="" />
          </label> 
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleUserImage}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="Email" />
          <div className="password-container">
            <input
              type={type}
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <span className="eye-icon" onClick={handleToggle}>
              <Icon icon={icon} size={25} />
            </span>
          </div>
          <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
