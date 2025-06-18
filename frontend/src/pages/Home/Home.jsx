import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetProjectsByRole } from "../../apicalls/projects";
import { SetLoading } from "../../redux/loadersSlice";
import { PlusOutlined } from "@ant-design/icons";
import { message, Button } from "antd";
import { getDateFormat } from "../../utils/helpers";
import Divider from "../../components/Divider";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import ProjectForm from "../Profile/Projects/ProjectForm";
import "./Home.css";

const Home = () => {

    const [projects, setProjects] = useState([]);
    const { user } = useSelector((state) => state.users);
    const [show, setShow] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
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
            <Button
                type="default"
                className="projects-add-button"
                onClick={() => {
                    setSelectedProject(null);
                    setShow(true);
                }}
            >
                Project <PlusOutlined />
            </Button>

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
            {show && (
                <ProjectForm
                    show={show}
                    setShow={setShow}
                    reloadData={getData}
                    project={selectedProject}
                />
            )}
        </div>
    )
}

export default Home

