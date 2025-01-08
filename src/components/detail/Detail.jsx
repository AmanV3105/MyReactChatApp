import React, { useEffect, useState } from "react";
import "./detail.css";
import { auth, db } from "../../Firebase/Firebase";
import useUserStore from "../../Firebase/Store";
import useChatStore from "../../Firebase/ChatStore";
import { arrayRemove, arrayUnion, doc, updateDoc, onSnapshot } from "firebase/firestore";

const Detail = () => {
  const { currentUser } = useUserStore();
  const { changeBlock, chatId, user, isCurrentUserBlocked, isRecieverBlocked } = useChatStore();
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [photoToggle, setPhotoToggle] = useState(false);
  const [fileToggle, setFileToggle] = useState(false);

  // Fetch shared photos and files from Firestore
  useEffect(() => {
    if (!chatId) return;

    const chatDocRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const messages = docSnapshot.data().messages || [];

        // Extract shared photos
        const photos = messages
          .filter((message) => message.image) // Filter messages with images
          .map((message) => ({
            imageUrl: message.image,
            timestamp: message.createdAt?.toDate() || new Date(),
          }));
        setSharedPhotos(photos);

        // Extract shared files
        const files = messages
          .filter((message) => message.application) // Filter messages with files
          .map((message) => ({
            fileUrl: message.application.url,
            fileName: message.application.name,
            timestamp: message.createdAt?.toDate() || new Date(),
          }));
        setSharedFiles(files);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const handleBlock = async () => {
    if (!user) {
      return;
    }
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.userImage || "./avatar.png"} alt="" />
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

        {/* Shared Photos */}
        <div className="option">
          <div className="title">
            <span style={{fontWeight:"bold"}}>Shared Photos</span>
            <img
              src={photoToggle ? "./arrowDown.png" : "./arrowUp.png"}
              alt=""
              onClick={() => setPhotoToggle(!photoToggle)}
            />
          </div>
          {photoToggle && (
            <div className="photos">
              {sharedPhotos.length > 0 ? (
                sharedPhotos.map((photo, index) => (
                  <div className="photoItem" key={index}>
                    {/* <div className="photo_detail" style={{border: "1px solid black" ,padding: "5px", backgroundColor: "rgba(0, 0, 0, 0.41)", borderRadius:"10px"}}>  */}
                    <div className="photo_detail"> 
                      <img src={photo.imageUrl} alt={`Shared Photo ${index + 1}`} />
                      <span>{`photo_${index + 1}.jpg`}</span>
                    </div>
                    <a href={photo.imageUrl} download>
                      <img
                        src="./download_1.png"
                        alt="Download Icon"
                        className="icon"
                      />
                    </a>
                  </div>
                ))
              ) : (
                <p>No shared photos yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Shared Files */}
        <div className="option">
          <div className="title" style={{marginBottom: "10px"}}>
            <span style={{fontWeight:"bold"}}>Shared Files</span>
            <img
              src={fileToggle ? "./arrowDown.png" : "./arrowUp.png"}
              alt=""
              onClick={() => setFileToggle(!fileToggle)}
            />
          </div>
          {fileToggle && (
            <div className="files">
              {sharedFiles.length > 0 ? (
                sharedFiles.map((file, index) => (
                  <div className="fileItem" key={index} style={{border: "1px solid black" , marginBottom: "10px", padding: "10px", backgroundColor: "rgba(0, 0, 0, 0.41)", borderRadius:"10px"}}>
                    <div className="file_detail">
                      <a href={file.fileUrl} download={file.fileName} style={{textDecoration: "none", color: "black"}}>
                        <span>{file.fileName}</span>
                      </a>
                    </div>
                    {/* <a href={file.fileUrl} download={file.fileName}> */}
                      {/* <img
                        src="./download.png"
                        alt="Download Icon"
                        className="icon"
                      /> */}
                    {/* </a> */}
                  </div>
                ))
              ) : (
                <p>No shared files yet.</p>
              )}
            </div>
          )}
        </div>

        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked"
            : isRecieverBlocked
            ? "Unblock User"
            : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
