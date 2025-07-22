import { Button, message, Table, Tooltip, Modal } from "antd";
import { React, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteProject, GetAllProjects } from "../../../apicalls/projects";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";
import ProjectForm from "./ProjectForm";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { socket } from "../../../socket";
import "./Projects.css";


const Projects = () => {

    const [selectedProject, setSelectedProject] = useState(null);
    const [projects, setProjects] = useState([]);
    const [show, setShow] = useState(false);
    const { user } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getData = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetAllProjects({ owner: user._id });
            if (response.success) {
                setProjects(response.data);
            } else {
                throw new Error(response.error);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(SetLoading(false));
        }
    };

    const onDelete = async (id) => {
        try {
            dispatch(SetLoading(true));
            const response = await DeleteProject(id);
            if (response.success) {
                message.success(response.message);
                getData();
                socket.emit("project-deleted", { projectId: id });
            } else {
                throw new Error(response.error);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(SetLoading(false));
        }
    };

    useEffect(() => {
        getData();
        if (user?._id) {
            socket.emit("join", user._id); // Join room to receive real-time updates
        }
        socket.on("project-updated", (data) => {
            // Optionally, check data.type if necessary and update state
            getData();  // refresh the list when a project update event is received
        });

        return () => {
            socket.off("project-updated");
        };
    }, []);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text, record) => (
                <span
                    className="projects-name"
                    onClick={() => navigate(`/project/${record._id}`)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text) => text.toUpperCase(),
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            render: (text) => getDateFormat(text),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => (
                <div className="projects-action-icons" style={{ display: "flex", gap: "10px" }}>
                    <Tooltip title="Delete">
                        <DeleteOutlined
                            style={{ color: "#e53e3e", fontSize: "20px", cursor: "pointer" }}
                            onClick={() => onDelete(record._id)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setSelectedProject(record);
                                setShow(true);
                            }}
                        >
                            Edit
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];


    return (
        <div className="projects-container">
            <div className="flex justify-end">
                <Button
                    type="default"
                    className="projects-add-button"
                    onClick={() => {
                        setSelectedProject(null);
                        setShow(true);
                    }}
                >
                    Add Project
                </Button>
            </div>
            <Table columns={columns} dataSource={projects} className="projects-table" rowKey="_id" />            {show && (
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

export default Projects