import React from 'react'
import './userInfo.css'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import useUserStore from '../../../Firebase/Store';

const UserInfo = () => {
  const {currentUser} = useUserStore();
  return (
    <div className='userInfo'>
        <div className='user'>
            <img src = {currentUser.userImage || "./avatar.png"}></img>
            <h3 style={{marginRight : "23px"}}>{currentUser.username}</h3>
        </div>
        <div className='icons'>
            <MoreHorizIcon/>
            <VideocamIcon/>
            <EditIcon/>
        </div>
    </div>
  )
}

export default UserInfo