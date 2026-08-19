import { BrowserRouter, Routes, Route } from "react-router-dom";

import Room from "./pages/room";
import Login from "./pages/login";
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login/>} />    
                <Route path="/register" element={<Register/>} />   
                <Route path="/dashboard" element={<Dashboard/>} />             
                <Route path="/room/:roomId" element={<Room />} />
                
            </Routes>
        </BrowserRouter>
    );
}

export default App;