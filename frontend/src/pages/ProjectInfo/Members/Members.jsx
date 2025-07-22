import { Button, message, Table } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RemoveMemberFromProject } from "../../../apicalls/projects";
import { SetLoading } from "../../../redux/loadersSlice";
import { socket } from "../../../socket";
import MemberForm from "./MemberForm";
import "./Members.css";



const Members = ({ project, reloadData }) => {

    const [role, setRole] = React.useState("");
    const [showMemberForm, setShowMemberForm] = React.useState(false);
    const { user } = useSelector((state) => state.users);

    const dispatch = useDispatch();
    const isOwner = project.owner._id === user._id;

    const deleteMember = async (memberId) => {
        try {
            dispatch(SetLoading(true));
            const response = await RemoveMemberFromProject({
                projectId: project._id,
                memberId,
            });
            if (response.success) {
                reloadData();
                message.success(response.message);
                // Emit socket event to notify other clients of member removal
                socket.emit("member-removed", {
                    projectId: project._id,
                    memberId,
                });
            } else {
                throw new Error(response.message);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    const columns = [
        {
            title: "First Name",
            dataIndex: "firstName",
            render: (text, record) => record.user.firstName,
        },
        {
            title: "Last Name",
            dataIndex: "lastName",
            render: (text, record) => record.user.lastName,
        },
        {
            title: "Email",
            dataIndex: "email",
            render: (text, record) => record.user.email,
        },
        {
            title: "Role",
            dataIndex: "role",
            render: (text, record) => record.role.toUpperCase(),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => (
                <Button type="link" danger onClick={() => deleteMember(record._id)}>
                    Remove
                </Button>
            ),
        },
    ];

    if (!isOwner) {
        columns.pop();
    }

    return (
        <div className="members-container">
            <div className="flex justify-end">
                {isOwner && (
                    <Button
                        type="default"
                        onClick={() => setShowMemberForm(true)}
                        className="members-add-button"
                    >
                        Add Member
                    </Button>
                )}
            </div>

            <div className="members-role-filter">
                <span>Select Role</span>
                <select
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                    className="members-role-select"
                >
                    <option value="">All</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                </select>
            </div>

            <Table
                columns={columns}
                dataSource={project.members.filter((member) => {
                    if (role === "") {
                        return true;
                    } else {
                        return member.role === role;
                    }
                })}
                className="members-table"
            />

            {showMemberForm && (
                <MemberForm
                    showMemberForm={showMemberForm}
                    setShowMemberForm={setShowMemberForm}
                    reloadData={reloadData}
                    project={project}
                />
            )}
        </div>
    )
}

export default Members