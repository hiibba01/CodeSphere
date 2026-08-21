import { useState } from "react";
import axios from "axios";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {

            const response = await API.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            navigate("/dashboard");

        } catch (error) {

            alert(
                error.response?.data?.message || "Login failed!"
            );

        }
    };

    return (

        <div className="min-h-screen bg-[#0F0F10] flex justify-center items-center px-4">

            <div className="w-full max-w-md bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-8">

                <h1 className="text-3xl sm:text-4xl text-white font-bold text-center">
                    CodeSphere
                </h1>

                <p className="text-zinc-400 text-center mt-2">
                    Welcome Back
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-8 bg-[#242424] text-white rounded-lg px-4 py-3 outline-none border border-zinc-700"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleLogin();
                        }
                    }}
                    className="w-full mt-4 bg-[#242424] text-white rounded-lg px-4 py-3 outline-none border border-zinc-700"
                />

                <button
                    onClick={handleLogin}
                    className="w-full mt-6 bg-gradient-to-r from-zinc-700 to-black py-3 rounded-lg text-white hover:scale-[1.02] transition"
                >
                    Login
                </button>

                <p className="text-center text-zinc-400 mt-5">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-white ml-2"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>

    );

};

export default Login;