import { Button, message, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteTask, GetAllTasks, UpdateTask } from "../../../apicalls/tasks";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";
import Divider from "../../../components/Divider";
import TaskForm from "./TaskForm";
import { AddNotification } from "../../../apicalls/notifications";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../socket";
import "./Tasks.css";


const Tasks = ({ project }) => {

    // const {message} = App.useApp();

    const [filters, setFilters] = useState({
        status: "all",
        assignedTo: "all",
        assignedBy: "all",
    });
    const [showViewTask, setShowViewTask] = React.useState(false);
    const { user } = useSelector((state) => state.users);
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = React.useState(false);
    const [task, setTask] = React.useState(null);
    const dispatch = useDispatch();
    const isEmployee = project.members.find(
        (member) => member.role === "employee" && member.user._id === user._id
    );

    const getTasks = async () => {
        try {
            dispatch(SetLoading(true));
            const response = await GetAllTasks({
                project: project._id,
                ...filters,
            });
            dispatch(SetLoading(false));
            if (response.success) {
                setTasks(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    const deleteTaks = async (id) => {
        try {
            dispatch(SetLoading(true));
            const response = await DeleteTask(id);
            if (response.success) {
                getTasks();
                message.success(response.message);
                socket.emit("task-deleted", { projectId: project._id, taskId: id });
            } else {
                throw new Error(response.message);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    const onStatusUpdate = async ({ task, status }) => {
        try {
            dispatch(SetLoading(true));
            const response = await UpdateTask({
                _id: task._id,
                status,
            });
            if (response.success) {
                getTasks();
                message.success(response.message);
                socket.emit("task-updated", { projectId: project._id, task: response.data });

                AddNotification({
                    title: "Task Status Updated",
                    description: `${task.name} status has been updated to ${status}`,
                    user: task.assignedBy._id,
                    onClick: `/project/${project._id}`,
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

    useEffect(() => {
        const handleTaskCreated = (data) => {
            if (data.projectId === project._id) {
                getTasks();
            }
        };

        const handleTaskUpdated = (data) => {
            if (data.projectId === project._id) {
                getTasks();
            }
        };

        const handleTaskDeleted = (data) => {
            if (data.projectId === project._id) {
                getTasks();
            }
        };

        socket.on("task-created", handleTaskCreated);
        socket.on("task-updated", handleTaskUpdated);
        socket.on("task-deleted", handleTaskDeleted);

        return () => {
            socket.off("task-created", handleTaskCreated);
            socket.off("task-updated", handleTaskUpdated);
            socket.off("task-deleted", handleTaskDeleted);
        };
    }, [project._id]);


    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text, record) => (
                <span
                    className="task-name"
                    onClick={() => {
                        setTask(record);
                        setShowViewTask(true);
                    }}
                >
                    {record.name}
                </span>
            ),
        },
        {
            title: "Assigned To",
            dataIndex: "assignedTo",
            render: (text, record) =>
                record.assignedTo.firstName + " " + record.assignedTo.lastName,
        },
        {
            title: "Assigned By",
            dataIndex: "assignedBy",
            render: (text, record) =>
                record.assignedBy.firstName + " " + record.assignedBy.lastName,
        },
        {
            title: "Assigned On",
            dataIndex: "createdAt",
            render: (text, record) => getDateFormat(text),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => {
                return (
                    <select
                        value={record.status}
                        onChange={(e) => {
                            onStatusUpdate({
                                task: record,
                                status: e.target.value,
                            });
                        }}
                        disabled={record.assignedTo._id !== user._id && isEmployee}
                    >
                        <option value="pending">Pending</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                    </select>
                );
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => {
                return (
                    <div className="action-buttons">
                        <Button
                            type="primary"
                            onClick={() => {
                                setTask(record);
                                setShowTaskForm(true);
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            type="primary"
                            danger
                            onClick={() => {
                                deleteTaks(record._id);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    if (isEmployee) {
        columns.pop();
    }

    useEffect(() => {
        getTasks();
    }, [filters]);

    return (
        <div className="tasks-container">
            {!isEmployee && (
                <div className="flex justify-end">
                    <Button
                        type="default"
                        className="add-task-btn"
                        onClick={() => setShowTaskForm(true)}
                    >
                        Add Task
                    </Button>
                </div>
            )}

            <div className="tasks-filters">
                <div>
                    <span>Status</span>
                    <select
                        value={filters.status}
                        onChange={(e) => {
                            setFilters({
                                ...filters,
                                status: e.target.value,
                            });
                        }}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div>
                    <span>Assigned By</span>
                    <select
                        value={filters.assignedBy}
                        onChange={(e) => {
                            setFilters({
                                ...filters,
                                assignedBy: e.target.value,
                            });
                        }}
                    >
                        <option value="all">All</option>
                        {project.members
                            .filter((m) => m.role === "admin" || m.role === "owner")
                            .map((m) => (
                                <option key={m.user._id} value={m.user._id}>
                                    {m.user.firstName + " " + m.user.lastName}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <span>Assigned To</span>
                    <select
                        value={filters.assignedTo}
                        onChange={(e) => {
                            setFilters({
                                ...filters,
                                assignedTo: e.target.value,
                            });
                        }}
                    >
                        <option value="all">All</option>
                        {project.members
                            .filter((m) => m.role === "employee")
                            .map((m) => (
                                <option key={m.user._id} value={m.user._id}>
                                    {m.user.firstName + " " + m.user.lastName}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={tasks.map(task => ({ ...task, key: task._id }))}
                className="mt-5"
            />

            {showTaskForm && (
                <TaskForm
                    showTaskForm={showTaskForm}
                    setShowTaskForm={setShowTaskForm}
                    project={project}
                    reloadData={getTasks}
                    task={task}
                />
            )}

            {showViewTask && (
                <Modal
                    title="TASK DETAILS"
                    open={showViewTask}
                    onCancel={() => setShowViewTask(false)}
                    centered
                    footer={null}
                    width={700}
                    className="task-details-modal"
                >
                    <Divider />
                    <div className="flex flex-col">
                        <span className="task-name">
                            {task.name}
                        </span>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-[14px] text-gray-500">
                            {task.description}
                        </span>

                        <div className="flex gap-5">
                            {task.attachments.map((image) => {
                                return (
                                    <img
                                        src={image}
                                        alt=""
                                        className="w-40 h-40 object-cover mt-2 p-2 border border-solid rounded border-gray-500"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </Modal>
            )}
        </div>)
}

export default Tasks