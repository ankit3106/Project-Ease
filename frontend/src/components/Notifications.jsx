import { message, Modal, Button } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteAllNotifications, MarkNotificationAsRead } from "../apicalls/notifications";
import { SetLoading } from "../redux/loadersSlice";
import { SetNotifications } from "../redux/usersSlice";
import { socket } from "../socket";
import "./Notifications.css";

function Notifications({ showNotifications, setShowNotifications, reloadNotifications }) {
    const { notifications } = useSelector((state) => state.users);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const readNotifications = async () => {
        try {
            const response = await MarkNotificationAsRead();
            if (response.success) {
                console.log(response.data);
                dispatch(SetNotifications(response.data));
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await DeleteAllNotifications();
            dispatch(SetLoading(false));
            if (response.success) {
                dispatch(SetNotifications([]));
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    useEffect(() => {
        if (notifications.length > 0) {
            readNotifications();
        }
    }, [notifications]);

    useEffect(() => {
        socket.on("new-notification", (notification) => {
            dispatch(SetNotifications((prev) => [notification, ...prev]));
            message.info(notification.title); // Optional toast
        });
        // Automatically remove the listener on cleanup
        return () => {
            socket.off("new-notification");
        };
    }, []);

    return (
        <Modal
            title="NOTIFICATIONS"
            open={showNotifications}
            onCancel={() => setShowNotifications(false)}
            centered
            footer={null}
            width={1000}
        >
            <div className="notification-modal-content">
                {notifications.length > 0 ? (
                    <div className="flex justify-end" style={{ marginBottom: 10 }}>
                        <span
                            className="notification-delete-all"
                            onClick={deleteAllNotifications}
                            style={{ cursor: "pointer", marginRight: 16 }}
                        >
                            Delete All
                        </span>
                        <Button onClick={reloadNotifications}>Reload</Button>
                    </div>
                ) : (
                    <div className="notification-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span>No Notifications</span>
                        <Button style={{ marginTop: 10 }} onClick={reloadNotifications}>
                            Reload
                        </Button>
                    </div>
                )}
                {notifications.map((notification) => (
                    <div
                        className="notification-item"
                        key={notification._id}
                        onClick={() => {
                            setShowNotifications(false);
                            navigate(notification.onClick);
                        }}
                    >
                        <div>
                            <span className="notification-title">
                                {notification.title}
                            </span>
                            <br />
                            <span className="notification-description">
                                {notification.description}
                            </span>
                        </div>
                        <div>
                            <span className="notification-time">
                                {moment(notification.createdAt).fromNow()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
}

export default Notifications;