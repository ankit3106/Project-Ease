import { Button, message, Table, Tooltip, Modal } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteProject, GetAllProjects } from "../../../apicalls/projects";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";
import ProjectForm from "./ProjectForm";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import "./Projects.css";


const Projects = () => {

    const [selectedProject, setSelectedProject] = React.useState(null);
    const [projects, setProjects] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [filters, setFilters] = React.useState({
        status: "all"
    });
    const { user } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getData = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetAllProjects({ 
                owner: user._id,
                ...filters
                // status: filters.status === "all" ? "" : filters.status
            });
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
            } else {
                throw new Error(response.error);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(SetLoading(false));
        }
    };

    React.useEffect(() => {
        getData();
    }, [filters]);

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
            <div className="projects-filters" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Status:</span>
                    <select
                        value={filters.status}
                        onChange={(e) => {
                            setFilters({
                                ...filters,
                                status: e.target.value,
                            });
                        }}
                        style={{ padding: "4px 8px", borderRadius: "4px" }}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
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