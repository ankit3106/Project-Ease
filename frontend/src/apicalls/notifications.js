import { apiRequest } from ".";

export const AddNotification = async (notification) => apiRequest("post", "/api/notifications/add-notification", notification);

export const GetAllNotifications = async () => apiRequest("get", "/api/notifications/get-all-notifications");

export const MarkNotificationAsRead = async (id) => apiRequest("post", "/api/notifications/mark-as-read");

export const DeleteAllNotifications = async () => apiRequest("delete", "/api/notifications/delete-all-notifications");