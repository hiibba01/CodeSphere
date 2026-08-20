import React from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {LogOut} from "lucide-react";

import socket from "../services/socket"
import logo from "../assets/SyncSpace.png";
import Whiteboard from '../components/whiteboard';
import CodeEditor  from '../components/codeEditor';

import API from "../api/axios";

const Room = () => {
  
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [room, setRoom] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    

    useEffect(() => {

        const fetchRoom = async()=>{
            try {
            
            const token = localStorage.getItem("token");

            const response = await API.get(`/rooms/${roomId}`);

            setRoom(response.data.room);

        } catch (error) {
            console.log(error);
        };
        }

        fetchRoom();



        socket.connect();

        const user = JSON.parse(localStorage.getItem("user"));

        socket.emit("join-room", {
            roomId,
            name: user.name,
            profileImage: user.profileImage,
            userId: user._id
        });

        socket.on("receive-message",(data)=>{
            console.log("Received message:", data);

            setMessages((prev) => [...prev, data]);
        });

        socket.on("participants-updated", (participants) => {
            console.log(participants);

            setParticipants(participants);
        });  
        
        socket.on("participant-status-updated", () => {
            console.log("Participant status changed");

    // Refresh room information from database
            fetchRoom();
        });

        return () => {

            socket.emit("leave-room", {
                roomId
            });
            socket.off("receive-message");
            socket.off("participants-updated");

            socket.off("participant-status-updated");

            socket.disconnect();
        };
    }, [roomId]);

    const sendMessage = () => {
        if(!message.trim()) return;

        socket.emit("send-message", {
            roomId,
            message,
            sender: user.name
        });

        setMessages((prev)=>[
            ...prev,
            {
                sender: "You",
                message
            }
        ]);
        setMessage("");
    }


    const leaveRoom = () => {
        socket.emit("leave-room", roomId);
       
        setTimeout(()=>{
            socket.disconnect();
            navigate("/dashboard");
        }, 100);
    }

    return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col">

        {/* Header */}
        <header className="border-b border-zinc-800 bg-[#141414] px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-4">

            <img
                src={logo}
                alt="SyncSpace Logo"
                className="logo w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full object-cover border border-zinc-700 cursor-pointer"
            />

            <div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">
                    SyncSpace
                </h1>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-xs sm:text-sm text-zinc-400 break-all">
                    Room Code: {room?.roomCode}
                    
                </p>

                <button
                onClick={()=> navigator.clipboard.writeText(room?.roomCode || "")}
                className="w-fit text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition duration-300">
                    Copy
                </button>
                </div>

            </div>

        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-300"></div>
            <span className="text-zinc-300">
                Connected
            </span>

            <button 
                onClick={leaveRoom}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition duration-300"
            >
                <LogOut size={18} />
                <span>Leave</span>
            </button>
        </div>
     </div>   

    </header>

    <div className="mx-4 sm:mx-6 lg:mx-10 mt-6 bg-[#1A1A1A] border border-zinc-800 rounded-xl p-4">
        <h2 className='text-lg sm:text-xl font-semibold mb-3'>
            Participants ({participants.length})
        </h2>

        {participants.length === 0 ? (
            <p className='text-zinc-500'>No participants</p>
        ) : (
            participants.map((user) => (
                <div
                key={user.socketId}
                className='flex items-center gap-3 py-2 border-b border-zinc-800 last:border-none'>
                    <img src={user.profileImage} alt={user.name} 
                    className="w-10 h-10 rounded-full border border-zinc-700"
                    />

                    <p>{user.name}</p>



                </div>
            ))
        )}

    </div>

    {/* Whiteboard */}

    <div  className="px-4 sm:px-6 lg:px-10 mt-6" >
        <Whiteboard roomId={roomId}/>
    </div>

    {/* code editor */}

    <div className='mt-6 lg:mt-8'>
        <CodeEditor/>
    </div>

        {/* Messages */}

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5 hide-scrollbar">

            {messages.length === 0 ? (

                <div className="h-full flex justify-center items-center text-zinc-500 text-lg">
                    No messages yet...
                </div>

            ) : (

                messages.map((msg, index) => (

                    <div
                        key={index}
                        className={`flex ${
                            msg.sender === "You"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >

                        <div
                            className={`max-w-[90%] sm:max-w-md px-5 py-4 rounded-2xl border shadow-lg

                            ${
                                msg.sender === "You"
                                    ? "bg-gradient-to-br from-zinc-700 to-black border-zinc-600"
                                    : "bg-[#1A1A1A] border-zinc-700"
                            }`}
                        >

                            <p className="text-xs text-zinc-400 mb-2">
                                {msg.sender}
                            </p>

                            <p className="text-white break-words">
                                {msg.message}
                            </p>

                        </div>

                    </div>

                ))

            )}

        </main>

        {/* Bottom */}

        <footer className="border-t border-zinc-800 bg-[#141414] p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row gap-4">

                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        }
                    }}
                    className="w-full flex-1 bg-[#1E1E1E] border border-zinc-700 rounded-xl px-5 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-zinc-400"
                />

                <button
                    onClick={sendMessage}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-zinc-700 to-black border border-zinc-600 hover:from-zinc-600 hover:to-zinc-900 transition-all duration-300"
                >
                    Send
                </button>

            </div>

        </footer>

    </div>
);
}

export default Room