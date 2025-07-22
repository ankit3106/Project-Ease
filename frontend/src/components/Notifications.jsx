import { message, Modal } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteAllNotifications, MarkNotificationAsRead } from "../apicalls/notifications";
import { SetLoading } from "../redux/loadersSlice";
import { SetNotifications } from "../redux/usersSlice";
import "./Notifications.css";

function Notifications({ showNotifications, setShowNotifications }) {
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
                    <div className="flex justify-end">
                        <span
                            className="notification-delete-all"
                            onClick={deleteAllNotifications}
                        >
                            Delete All
                        </span>
                    </div>
                ) : (
                    <div className="notification-empty">
                        <span>No Notifications</span>
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
