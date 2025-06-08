import { message, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { GetProjectById } from "../../apicalls/projects";
import { GetAllTasks } from "../../apicalls/tasks";
import Divider from "../../components/Divider";
import { SetLoading } from "../../redux/loadersSlice.js";
import { getDateFormat } from "../../utils/helpers.js";
import Members from "./Members/Members";
import Tasks from "./Tasks/Tasks";
import "./ProjectInfo.css";


const ProjectInfo = () => {

    const [currentUserRole, setCurrentUserRole] = useState("");
    const { user } = useSelector((state) => state.users);
    const [project, setProject] = useState(null);
    const dispatch = useDispatch();
    const params = useParams();
    const getData = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetProjectById(params.id);
            dispatch(SetLoading(false));
            if (response.success) {
                setProject(response.data);
                const currentUser = response.data.members.find(
                    (member) => member.user._id === user._id
                );
                setCurrentUserRole(currentUser.role);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        project && (
            <div className="projectinfo-container">
                <div className="projectinfo-header">
                    <div>
                        <h1 className="projectinfo-title">{project?.name}</h1>
                        <span className="projectinfo-description">{project?.description}</span>
                        <div className="projectinfo-meta-group">
                            <span className="projectinfo-meta-label">Role</span>
                            <span className="projectinfo-meta-value" style={{ textTransform: "uppercase" }}>
                                {currentUserRole}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="projectinfo-meta-group">
                            <span className="projectinfo-meta-label">Created At</span>
                            <span className="projectinfo-meta-value">{getDateFormat(project.createdAt)}</span>
                        </div>
                        <div className="projectinfo-meta-group">
                            <span className="projectinfo-meta-label">Created By</span>
                            <span className="projectinfo-meta-value">
                                {project.owner.firstName} {project.owner.lastName}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="projectinfo-divider" />
                <Tabs
                    className="projectinfo-tabs"
                    defaultActiveKey="1"
                    items={[
                        {
                            label: "Tasks",
                            key: "1",
                            children: <Tasks project={project} />,
                        },
                        {
                            label: "Members",
                            key: "2",
                            children: <Members project={project} reloadData={getData} />,
                        },
                    ]}
                />
            </div>
        ))
}

export default ProjectInfo