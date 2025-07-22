import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetProjectsByRole } from "../../apicalls/projects";
import { SetLoading } from "../../redux/loadersSlice";
import { message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDateFormat } from "../../utils/helpers";
import Divider from "../../components/Divider";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../Profile/Projects/ProjectForm";
import Navbar from "../../components/Navbar";
import "./Home.css";

const Home = () => {

    const [projects, setProjects] = useState([]);
    const { user } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getData = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetProjectsByRole();
            dispatch(SetLoading(false));
            if (response.success) {
                setProjects(response.data);
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
        if (user?._id) {
            socket.emit("join", user._id); // ✅ Join room to receive real-time updates
        }
    }, [user?._id]);

    return (
        <div className="home-container">
            <h1 className="home-welcome text-primary text-xl">
                Heyy {user?.firstName} {user?.lastName}, Welcome to Project-Ease
            </h1>

            <div className="home-project-grid">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div
                            key={project._id}
                            className="home-project-card"
                            onClick={() => navigate(`/project/${project._id}`)}
                        >
                            <h1 className="home-project-name">{project.name}</h1>
                            <Divider className="home-project-divider" />
                            <div className="home-project-info">
                                <span>Created At: {getDateFormat(project.createdAt)}</span>
                                <span>Owner: {project.owner.firstName}</span>
                                <span>Status: {project.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="home-no-projects">You have no projects yet</div>
                )}
            </div>
        </div>
    )
}

export default Home

