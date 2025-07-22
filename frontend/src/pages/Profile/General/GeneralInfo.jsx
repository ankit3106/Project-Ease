import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button, Input, message } from "antd";
// import { updateProfile, changePassword, deleteAccount } from "../../apicalls/users"; // implement these as needed

const GeneralInfo = () => {
    const { user } = useSelector((state) => state.users);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ old: "", new: "" });

    // Example handlers (implement API calls as needed)
    const handleProfileSave = async () => {
        // await updateProfile(profile);
        message.success("Profile updated!");
        setEditMode(false);
    };

    const handlePasswordChange = async () => {
        // await changePassword(passwords);
        message.success("Password changed!");
        setShowPasswordModal(false);
    };

    const handleDeleteAccount = async () => {
        // await deleteAccount();
        message.success("Account deleted!");
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto mt-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Account Information</h2>
            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.firstName}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border"
                />
                <Button type="link">Change Photo</Button>
            </div>
            {/* Profile Info */}
            <div className="mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {editMode ? (
                    <>
                        <Input
                            value={profile.firstName}
                            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                            style={{ width: 120, marginRight: 8 }}
                        />
                        <Input
                            value={profile.lastName}
                            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                            style={{ width: 120 }}
                        />
                    </>
                ) : (
                    `${user?.firstName} ${user?.lastName}`
                )}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Email:</span>{" "}
                {editMode ? (
                    <Input
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        style={{ width: 250 }}
                    />
                ) : (
                    user?.email
                )}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Role:</span> {user?.role}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Joined:</span>{" "}
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
            </div>
            {/* Actions */}
            <div className="flex gap-3 mt-4">
                {editMode ? (
                    <>
                        <Button type="primary" onClick={handleProfileSave}>Save</Button>
                        <Button onClick={() => setEditMode(false)}>Cancel</Button>
                    </>
                ) : (
                    <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                )}
                <Button onClick={() => setShowPasswordModal(true)}>Change Password</Button>
                <Button danger onClick={handleDeleteAccount}>Delete Account</Button>
            </div>
            {/* Change Password Modal */}
            <Modal
                title="Change Password"
                open={showPasswordModal}
                onCancel={() => setShowPasswordModal(false)}
                onOk={handlePasswordChange}
                okText="Change"
            >
                <Input.Password
                    placeholder="Old Password"
                    className="mb-2"
                    value={passwords.old}
                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                />
                <Input.Password
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                />
            </Modal>
        </div>
    );
};

export default GeneralInfo;