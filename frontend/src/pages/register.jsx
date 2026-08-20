import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

const Register = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const handleRegister = async () => {
        try {

            const formData = new FormData();

            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);

            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            const response = await API.post(
                "/auth/register",
                formData
            );

            alert(response.data.message);

            navigate("/");

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Registration failed!"
            );

        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F10] flex justify-center items-center px-4">

            <div className="w-full max-w-md bg-[#181818] border border-zinc-800 rounded-2xl p-6 sm:p-8">

                <h1 className="text-4xl text-white font-bold text-center">
                    SyncSpace
                </h1>

                <p className="text-zinc-400 text-center mt-2">
                    Create your account
                </p>

                {/* Profile Picture */}
<div className="flex flex-col items-center mt-6">

    <label className="relative cursor-pointer group">

        {/* Circular Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-600 bg-[#242424] flex items-center justify-center">

            {profileImage ? (
                <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-zinc-500 text-sm text-center px-4">
                    Add Photo
                </span>
            )}

        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="text-white text-sm">
                Change
            </span>
        </div>

        {/* Hidden File Input */}
        <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                    setProfileImage(e.target.files[0]);
                }
            }}
        />

    </label>

    <p className="text-zinc-400 text-sm mt-3">
        Click to add profile picture
    </p>

</div>

                {/* Name */}
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-8 bg-[#242424] text-white rounded-lg px-4 py-3 outline-none border border-zinc-700"
                />

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-4 bg-[#242424] text-white rounded-lg px-4 py-3 outline-none border border-zinc-700"
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-4 bg-[#242424] text-white rounded-lg px-4 py-3 outline-none border border-zinc-700"
                />

               

                {/* Register */}
                <button
                    onClick={handleRegister}
                    className="w-full mt-6 bg-gradient-to-r from-zinc-700 to-black py-3 rounded-lg text-white hover:scale-[1.02] transition"
                >
                    Register
                </button>

                <p className="text-center text-zinc-400 mt-5">
                    Already have an account?

                    <Link
                        to="/"
                        className="text-white ml-2"
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Register;