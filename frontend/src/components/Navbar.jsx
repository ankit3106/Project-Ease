import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();

  return (
    <nav className="bg-primary text-white px-8 py-4 flex justify-between items-center shadow rounded-xl mb-8">
      <div className="flex items-center gap-8">
        <span
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Project-Ease
        </span>
        <Link to="/" className="hover:underline text-lg">Home</Link>
        <Link to="/profile" className="hover:underline text-lg">Profile</Link>
        {/* Add more links as needed */}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
        <button
          className="bg-white text-primary px-4 py-1 rounded hover:bg-gray-100 font-semibold"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;