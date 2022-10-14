import { Box } from "@chakra-ui/react";
import { before } from "lodash";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import { ChatState } from "../Context/ChatProvider"


const ChatPage = () => {
  const {user} = ChatState();
  const[fetchAgain,setFetchAgain]=useState(false);
  // console.log("uiguy",user);
  return <div style={{width: "100%",color:"black"}}>
    {user && <SideDrawer/>}
    <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
      {user && <MyChats fetchAgain={fetchAgain}/>}
      {user && <ChatBox fetchAgain={fetchAgain}
      setFetchAgain={setFetchAgain}/>}
    </Box>


  </div>
}

export default ChatPage