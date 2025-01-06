import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase/Firebase";
import { doc, setDoc } from "firebase/firestore";
// import Uploadfile from "../../Firebase/Uploadfile";

const Login = () => {
  const [userImage, setUserImage] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);
  const handleUserImage = (e) => {
    const file = e.target.files[0];
    setUserImage({ file: file, url: URL.createObjectURL(file) });
  };
  const handleSubmit = async (e) =>{
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const {Email, password} = data;

    try{
      await signInWithEmailAndPassword(auth, Email, password);
    } catch(err){
      toast.error(err.message);
    } finally{
      setLoading(false);
    }
  }

  const handleRegister = async (e) =>{
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const {username, Email, password} = data;
    try {
      const res = await createUserWithEmailAndPassword(auth, Email, password);
    
      console.log("User created:", res.user.uid);
    
      // const imageURL = await Uploadfile(userImage.file);
      // console.log("Image URL:", imageURL);
    
      await setDoc(doc(db, "users", res.user.uid), {
        username: username,
        email: Email,
        // userImage: imageURL,
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
    

  }
  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Email" name="Email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled = {loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          {/* <label htmlFor="file">
            Upload an image
            <img src={userImage.url || "./avatar.png"} alt="" />
          </label> */}
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleUserImage}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="Email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled = {loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
