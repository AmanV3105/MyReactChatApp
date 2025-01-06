import React from 'react'
import './detail.css'
import { auth, db } from '../../Firebase/Firebase'
import useUserStore from '../../Firebase/Store';
import useChatStore from '../../Firebase/ChatStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
const Detail = () => {
  const { currentUser } = useUserStore();
  const { changeBlock, chatId, user, isCurrentUserBlocked , isRecieverBlocked} = useChatStore();

  const handleBlock = async ()=>{
    if(!user){
      return;
    }
    const userDocRef = doc(db, "users" , currentUser.id)
    try {
      await updateDoc(userDocRef, {
        blocked : isRecieverBlocked ?arrayRemove(user.id) : arrayUnion(user.id),
      })
      changeBlock();
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="detail">
      <div className="user">
        <img src="./avatar.png" alt="" />
        <h2>{user?.username}</h2>
        <p>Life is Beautiful</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photo_detail">
                <img src="https://plus.unsplash.com/premium_photo-1681488376930-688713d9c18f?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className = "icon"/>
            </div>
            <div className="photoItem">
              <div className="photo_detail">
                <img src="https://plus.unsplash.com/premium_photo-1681488376930-688713d9c18f?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className = "icon"/>
            </div>
            <div className="photoItem">
              <div className="photo_detail">
                <img src="https://plus.unsplash.com/premium_photo-1681488376930-688713d9c18f?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className = "icon"/>
            </div>
            <div className="photoItem">
              <div className="photo_detail">
                <img src="https://plus.unsplash.com/premium_photo-1681488376930-688713d9c18f?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className = "icon"/>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>{isCurrentUserBlocked ? "You are Blocked" : isRecieverBlocked ? "Unblock User" : "Block User"}</button>
        <button className="logout" onClick  ={()=> auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail