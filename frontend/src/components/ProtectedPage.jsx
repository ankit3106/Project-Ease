import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetLoggedInUser } from "../apicalls/users";
import { SetNotifications, SetUser } from "../redux/usersSlice";
import { SetLoading } from "../redux/loadersSlice";
import { GetAllNotifications } from "../apicalls/notifications";
import { Avatar, Badge, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { socket } from "../socket";
import Notifications from "./Notifications";
import "./ProtectedPage.css"

function ProtectedPage({ children }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, notifications } = useSelector((state) => state.users);
    const getUser = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetLoggedInUser();
            dispatch(SetLoading(false));
            if (response.success) {
                dispatch(SetUser(response.data));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const getNotifications = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetAllNotifications();
            dispatch(SetLoading(false));
            if (response.success) {
                dispatch(SetNotifications(response.data));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            getUser();
        } else {
            navigate("/login");
        }
    }, []);

    useEffect(() => {
        if (user) {
            getNotifications();
            socket.emit("join", user._id); 
        }
    }, [user]);

    return (
        user && (
            <div>
                <div className="protected-header">
                    <h1 className="protected-title" onClick={() => navigate("/")}>
                        Project-Ease
                    </h1>
                    <div className="protected-header-actions">
                        <span
                            className="protected-username"
                            onClick={() => navigate("/profile")}
                        >
                            {user?.firstName}
                        </span>
                        <Badge
                            count={notifications.filter((notification) => !notification.read).length}
                            className="protected-badge"
                        >
                            <div
                                className="bg-[#3498db] rounded-full p-2 cursor-pointer flex items-center justify-center"
                                onClick={() => setShowNotifications(true)}
                            >
                                <BellOutlined style={{ color: "gray", fontSize: 22 }} />
                            </div>
                        </Badge>
                    </div>
                    <button
                        className="protected-logout"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>


                <div className="px-5 py-3">{children}</div>

                {showNotifications && (
                    <Notifications
                        showNotifications={showNotifications}
                        setShowNotifications={setShowNotifications}
                        reloadNotifications={getNotifications}
                    />
                )}
            </div>
        )
    );
}

export default ProtectedPage;
