import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box,FormControl,IconButton,Input,Spinner,Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { getSender, getSenderFull } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import ScrollableChat from './ScrollableChat';
import animationData from "../animations/typing.json";

import Lottie from 'react-lottie';
import io from 'socket.io-client';
const ENDPOINT = "http://localhost:5000";
// const ENDPOINT = "https://whimsical-faloodeh-a4c249.netlify.app/";
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {

    const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

    const {user,selectedChat,setSelectedChat, notification, setNotification} = ChatState();
    const toast = useToast();
    // console.log(setFetchAgain);

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
    
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
    
          setLoading(true);
    
          const { data } = await axios.get(
            `/api/message/${selectedChat._id}`,
            config
          );
          setMessages(data);
          setLoading(false);
    
          socket.emit("join chat", selectedChat._id);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Messages",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      };

      useEffect(()=>{
        socket=io(ENDPOINT);
        socket.emit("setup",user);
        socket.on("connected",()=> setSocketConnected(true));
        socket.on("typing",()=>setIsTyping(true));
        socket.on("stop typing",()=>setIsTyping(false));
    },[]);

      useEffect(() => {
        fetchMessages();
    
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
      }, [selectedChat]);

      useEffect(()=>{
        socket.on('message received',(newMessageReceived)=>{
          if(!selectedChatCompare || selectedChatCompare._id!== newMessageReceived.chat._id){
            //give notification
            if(!notification.includes(newMessageReceived)){
              setNotification([newMessageReceived, ...notification]);
              setFetchAgain(!fetchAgain);
            }
          } 
          else{
            setMessages([...messages, newMessageReceived]);
          }
        })
      })

      

      const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
          socket.emit("stop typing", selectedChat._id);
          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            };
            setNewMessage("");
            const { data } = await axios.post(
              "/api/message",
              {
                content: newMessage,
                chatId: selectedChat._id,
              },
              config
            );
            socket.emit("new message", data);
            setMessages([...messages, data]);
          } catch (error) {
            toast({
              title: "Error Occured!",
              description: "Failed to send the Message",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          }
        }
      };
    const typingHanldler = (e) => {
        setNewMessage(e.target.value);

        // Typing Indicator Logic
        if(!socketConnected) return;

        if(!typing){
          setTyping(true);
          socket.emit('typing',selectedChat._id);
        }
        let lastTypingTime = new Date().getTime()
        var timerLength = 3000;
        setTimeout(()=>{
          var timeNow = new Date().getTime();
          var timeDiff = timeNow - lastTypingTime;

          if(timeDiff>=timerLength && typing){
            socket.emit('stop typing',selectedChat._id);
            setTyping(false);
          }
        },timerLength)
      };

  return (
    <>
    {selectedChat ? (
        <>
        <Text
        fontSize={{ base: "28px", md: "30px" }}
        pb={3}
        px={2}
        w="100%"
        fontFamily="Work sans"
        display="flex"
        justifyContent={{ base: "space-between" }}
        alignItems="center"
        color="black"
        
        // backgroundColor=""
        >
            <IconButton
              display={{ base: "flex", md: "none" }}
              color="#b0b0b0"
              icon={<ArrowBackIcon color="#b0b0b0"/>}
              onClick={() => setSelectedChat("")}
            />
            {/*messages &&*/
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
        </Text>
        <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        p={3}
        bg="#E8E8E8"
        w="100%"
        h="100%"
        borderRadius="lg"
        backgroundImage='url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9_8St9dM0qHBf15E6imcl6nMFwxOTCV0Uqw&usqp=CAU")'
        overflowY="hidden">
            {loading?(
                <Spinner
                    size="xl"
                    w={20}
                    h={20}
                    alignSelf="center"
                    margin="auto"
                />
            ):(
                <div className='messages'>
                    <ScrollableChat messages={messages}/>
                </div>
            )}

            <FormControl onKeyDown={sendMessage}isRequired mt={3} color="green">
              {istyping? <div>
                <span style={{marginTop:"40px"}}>Typing</span>
                <Lottie
                options={defaultOptions}
                // height={50}
                width={70}
                style={{ marginBottom: 15, marginLeft: 60 }}

                />
              </div> : <></>}
                <Input
                    variant="filled"
                    bg="#E0E0E0"
                    // bg="black"
                    placeholder="Enter a message..."
                    onChange={typingHanldler}
                    value={newMessage}
                    color="black"
                ></Input>
            </FormControl>
        </Box>
        </>
    ):(
        <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="100%"
        color="black"
        >
            <Text
            fontSize="3xl"
            pb={3}
            fontFamily="Work sans"
            >
                Click on a user to start cahtting
            </Text>
        </Box>
    )}
    </>
  )
}

export default SingleChat