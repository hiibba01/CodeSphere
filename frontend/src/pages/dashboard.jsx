import { useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { FiLink } from "react-icons/fi";
import { Hand, Users, Circle } from "lucide-react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/SyncSpace.png"
import socket from "../services/socket";

const Dashboard = () => {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const [roomName, setRoomName] = useState("");
    const [description, setDescription] = useState("");

    const [roomCode, setRoomCode] = useState("");

    const [rooms, setRooms] = useState([]);

   useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    fetchRooms();

    socket.connect();

    socket.on("participant-status-updated", () => {
        console.log("Participant status changed on dashboard");
        fetchRooms();
    });

    return () => {
        socket.off("participant-status-updated");
    };
}, []);

    const createRoom = async()=>{
        try {

            if(!roomName.trim()){
                alert("Please enter a room name!");
                return;
            }
            
            

            const response = await API.post("/rooms/create", {
            roomName,
            description
        });

            setRoomName("");
            setDescription("");
            setShowCreateModal(false);
            fetchRooms();

            alert(`Room created successfully!\n\n Room Code: ${response.data.room.roomCode}`);

            navigate(`/room/${response.data.room._id}`);

        } catch (error) {
            alert(
                error.response?.data?.message || "Unable to create room!"
            );
        }
    }


    const joinRoom = async()=>{
        try {

            if(!roomCode.trim()){
                alert("Please enter a room code!");
                return;
            }
            
            

            
        const response = await API.post("/rooms/join", {
            roomCode
        });
            
            setRoomCode("");
            setShowJoinModal(false);
            fetchRooms();

            navigate(`/room/${response.data.room._id}`);

        } catch (error) {
            alert(
                error.response?.data?.message || "Unable to join room!"
            );
        }
    }


    const fetchRooms = async()=>{
        try {
            
           

            const response = await API.get("/rooms/my-rooms");
            console.log("MY ROOMS FULL RESPONSE:", response.data);
            console.log("MY ROOMS:", response.data.rooms);

            setRooms(response.data.rooms || []);
            
        } catch (error) {
          console.log(
            "FETCH ROOMS ERROR:",
            error.response?.status,
            error.response?.data || error.message
        );

        setRooms([]);
        }
    };

    const getRoomStats = (room) => {
        const participants = room.participantsHistory || [];

        const totalParticipants = participants.length;

        const activeParticipants = participants.filter(
            (participant) => participant.isActive
        ).length;

        return{
            totalParticipants,
            activeParticipants,
            participants
        }
    }

    
    return (
        <div className="min-h-screen bg-[#0F0F10] text-white">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

                {/* Header */}

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-4">

                        <img
                            src={logo}
                            alt="CodeSphere Logo"
                            className="logo w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full object-cover border border-zinc-700 cursor-pointer"
                        />

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                            CodeSphere
                        </h1>

                    </div>

                    {user && (

                        <div className="flex items-center gap-3 bg-[#181818] px-4 py-3 rounded-2xl border border-zinc-800 w-full md:w-auto justify-center">

                            <img
                                src={user.profileImage}
                                alt="Profile"
                                className="w-14 h-14 rounded-full border border-zinc-700"
                            />

                            <div>

                                <h2 className="font-semibold text-lg">
                                    {user.name}
                                </h2>

                                <p className="text-zinc-400 text-sm">
                                    {user.email}
                                </p>

                            </div>

                        </div>

                    )}

                </div>

                {/* Welcome */}

                <div className="mt-20 text-center">

                    <div className="flex justify-center items-center gap-4">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center">
                        Welcome Back
                      </h2>

                      <Hand
                        size={48}
                        className="text-zinc-300 animate-pulse"
                     />
                </div>

                    <p className="text-base sm:text-lg lg:text-xl text-zinc-400 mt-5 text-center">
                        Collaborate, Code and Build together in real time
                    </p>

                </div>

                {/* Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mt-16">

                    {/* Create Room */}

                    <div 
                    onClick={()=>setShowCreateModal(true)}
                    className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 sm:p-8 lg:p-10 hover:scale-105 transition duration-300 cursor-pointer shadow-xl">

                        

                        <FiPlusCircle className="text-5xl sm:text-6xl text-zinc-300" />

                        <h2 className="text-2xl sm:text-3xl font-bold mt-6">
                            Create Room
                        </h2>

                        <p className="text-zinc-400 mt-4 leading-7">
                            Create a new collaborative workspace and invite your
                            teammates instantly
                        </p>

                    </div>

                    {/* Join Room */}

                    <div 
                    onClick={()=>setShowJoinModal(true)}
                    className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-10 hover:scale-105 transition duration-300 cursor-pointer shadow-xl">

                        

                        <FiLink className="text-5xl sm:text-6xl text-zinc-300" />

                        <h2 className="text-2xl sm:text-3xl font-bold mt-6">
                            Join Room
                        </h2>

                        <p className="text-zinc-400 mt-4 leading-7">
                            Join an existing room using the room code shared
                            with you
                        </p>

                    </div>

                </div>

                {/* Recent Rooms */}

                <div className="mt-24">

                    <h2 className="text-2xl sm:text-3xl font-bold mb-8">
                        Recent Rooms
                    </h2>

                    <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-8">

                        {rooms.length === 0 ? (
                            <p className="text-zinc-500 text-lg">
                                No rooms yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
    {rooms.map((room) => {

        const {
            totalParticipants,
            activeParticipants,
            participants
        } = getRoomStats(room);

        return (
            <div
                key={room._id}
                
                className="p-5 rounded-xl border border-zinc-700 bg-[#202020] hover:bg-[#2A2A2A] cursor-pointer transition"
            >

                {/* Room Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div>
                        <h3 className="text-xl font-semibold">
                            {room.roomName}
                        </h3>

                        <p className="text-zinc-400 text-sm mt-1">
                            Code: {room.roomCode}
                        </p>

                        <p className="text-zinc-400 text-sm mt-2">
                            Description: {room.description || "No description provided"}
                        </p>
                    </div>

                    {/* Participant Stats */}
                    <div className="flex gap-4 text-sm">

                        <span className="flex items-center gap-2 text-zinc-300">
                            <Users size={17} />
                            {totalParticipants} Participants
                        </span>

                        <span className="flex items-center gap-2 text-zinc-300">
                            <Circle size={10}
                            fill="currentColor"
                            className={activeParticipants > 0 ? "text-green-300" : "text-zinc-500"}
                             />
                            {activeParticipants} Active
                        </span>

                    </div>

                </div>

                {/* Last Activity */}
                <div className="mt-4 pt-4 border-t border-zinc-700">

                    <p className="text-zinc-400 text-sm">
                        Last activity:{" "}
                        <span className="text-zinc-300">
                            {room.lastActivity
                                ? new Date(room.lastActivity).toLocaleString()
                                : "No activity yet"}
                        </span>
                    </p>

                </div>

                {/* Participants */}
                {participants.length > 0 && (

                    <div className="mt-4 flex flex-wrap gap-3">

                        {participants.map((participant) => (

                            <div
                                key={participant._id}
                                className="flex items-center gap-2 bg-[#181818] border border-zinc-700 rounded-full px-3 py-2"
                            >

                                <img
                                    src={participant.profileImage}
                                    alt={participant.name}
                                    className="w-8 h-8 rounded-full"
                                />

                                <div className="flex items-center gap-2">

                                    <span className="text-sm">
                                        {participant.name}
                                    </span>

                                    <span
                                        className={
                                            participant.isActive
                                                ? "text-green-400 text-xs"
                                                : "text-zinc-500 text-xs"
                                        }
                                    >
                                        {participant.isActive
                                            ? "Active"
                                            : "Offline"}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

                <button
                onClick={()=>navigate(`/room/${room._id}`)}
                className="mt-5 px-5 py-2 rounded-lg border border-zinc-700 bg-[#202020] hover:bg-[#545050] cursor-pointer transition text-white font-medium "
                >
                    Enter Room
                </button>

            </div>
        );
    })}
</div>
                        )}

                    </div>

                </div>

            </div>



            {showCreateModal && (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-[#181818] border border-zinc-700 rounded-2xl p-5 sm:p-6 md:p-8">

            <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Create Room
            </h2>

            <input
                type="text"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-[#242424] border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-500"
            />

            <textarea
                placeholder="Description (Optional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-4 bg-[#242424] border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none resize-none focus:border-zinc-500"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

                <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
                >
                    Cancel
                </button>

                <button
                    onClick={createRoom}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-zinc-700 to-black border border-zinc-600 hover:from-zinc-600 hover:to-zinc-900 transition"
                >
                    Create
                </button>

            </div>

        </div>

    </div>
)}



    {showJoinModal && (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-[#181818] border border-zinc-700 rounded-2xl p-5 sm:p-6 md:p-8">

            <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Join Room
            </h2>

            <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-[#242424] border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-500"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

                <button
                    onClick={() => setShowJoinModal(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
                >
                    Cancel
                </button>

                <button
                    onClick={joinRoom}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-zinc-700 to-black border border-zinc-600 hover:from-zinc-600 hover:to-zinc-900 transition"
                >
                    Join
                </button>

            </div>

        </div>

    </div>
)}

        </div>
    );
};

export default Dashboard;