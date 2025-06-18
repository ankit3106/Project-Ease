import { Button, Form, Input, Modal, Tabs, Upload, App } from "antd"; import TextArea from "antd/es/input/TextArea";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddNotification } from "../../../apicalls/notifications";
import { CreateTask, UpdateTask, UploadImage } from "../../../apicalls/tasks";
import { SetLoading } from "../../../redux/loadersSlice";
import { socket } from "../../../socket";
import "./TaskForm.css"


const TaskForm = ({
    showTaskForm,
    setShowTaskForm,
    project,
    task,
    reloadData,
}) => {

    const { message } = App.useApp();

    const [selectedTab = "1", setSelectedTab] = React.useState("1");
    const [email, setEmail] = React.useState("");
    const { user } = useSelector((state) => state.users);
    const formRef = React.useRef(null);
    const [file = null, setFile] = React.useState(null);
    const [images = [], setImages] = React.useState(task?.attachments || []);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            let response = null;
            let assignedToUserId;
            if (!task) {
                // Only for create
                const assignedToMember = project.members.find(
                    (member) => member.user.email === email
                );
                assignedToUserId = assignedToMember?.user?._id;
            }
            dispatch(SetLoading(true));
            if (task) {
                // Update task
                response = await UpdateTask({
                    ...values,
                    project: project._id,
                    assignedTo: task.assignedTo._id,
                    _id: task._id,
                });
            } else {
                const assignedBy = user._id;
                response = await CreateTask({
                    ...values,
                    project: project._id,
                    assignedTo: assignedToUserId,
                    assignedBy,
                });
            }

            if (response.success) {
                if (!task) {
                    // Send notification to the assigned employee
                    AddNotification({
                        title: `You have been assigned a new task in ${project.name}`,
                        user: assignedToUserId,
                        onClick: `/project/${project._id}`,
                        description: values.description,
                    });
                    // Emit socket event for task creation
                    socket.emit("task-created", {
                        projectId: project._id,
                        task: response.data, // Ensure response contains the created task data
                    });
                } else {
                    // Emit socket event for task update
                    socket.emit("task-updated", {
                        projectId: project._id,
                        task: response.data, // Ensure response contains the updated task data
                    });
                }

                reloadData();
                message.success(response.message);
                setShowTaskForm(false);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    const validateEmail = () => {
        const employeesInProject = project.members.filter(
            (member) => member.role === "employee"
        );
        const isEmailValid = employeesInProject.find(
            (employee) => employee.user.email === email
        );
        return isEmailValid ? true : false;
    };

    const uploadImage = async () => {
        try {
            dispatch(SetLoading(true));
            const formData = new FormData();
            formData.append("file", file);
            formData.append("taskId", task._id);
            const response = await UploadImage(formData);
            if (response.success) {
                message.success(response.message);
                setImages([...images, response.data]);
                reloadData();
            } else {
                throw new Error(response.message);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    const deleteImage = async (image) => {
        try {
            dispatch(SetLoading(true));
            const attachments = images.filter((img) => img !== image);
            const response = await UpdateTask({
                ...task,
                attachments,
            });
            if (response.success) {
                message.success(response.message);
                setImages(attachments);
                reloadData();
            } else {
                throw new Error(response.message);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            message.error(error.message);
            dispatch(SetLoading(false));
        }
    };

    return (
        <Modal
            title={task ? "UPDATE TASK" : "CREATE TASK"}
            open={showTaskForm}
            onCancel={() => setShowTaskForm(false)}
            centered
            onOk={() => {
                formRef.current.submit();
            }}
            okText={task ? "UPDATE" : "CREATE"}
            width={800}
            {...(selectedTab === "2" && { footer: null })}
        >
            <Tabs
                activeKey={selectedTab}
                onChange={(key) => setSelectedTab(key)}
                items={[
                    {
                        label: "Task Details",
                        key: "1",
                        children: (
                            <Form
                                layout="vertical"
                                ref={formRef}
                                onFinish={onFinish}
                                initialValues={{
                                    ...task,
                                    assignedTo: task ? task.assignedTo.email : "",
                                }}
                            >
                                <Form.Item label="Task Name" name="name">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Task Description" name="description">
                                    <TextArea />
                                </Form.Item>
                                <Form.Item label="Assign To" name="assignedTo">
                                    <Input
                                        placeholder="Enter email of the employee"
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={task ? true : false}
                                    />
                                </Form.Item>
                                {email && !validateEmail() && (
                                    <div className="bg-red-700 text-sm p-2 rounded">
                                        <span className="text-white">
                                            Email is not valid or employee is not in the project
                                        </span>
                                    </div>
                                )}
                            </Form>
                        ),
                    },
                    {
                        label: "Attachments",
                        key: "2",
                        disabled: !task,
                        children: (
                            <>
                                <div className="flex gap-5 mb-5">
                                    {images.map((image) => (
                                        <div key={image} className="flex gap-3 p-2 border border-solid rounded border-gray-500 items-end">
                                            <img
                                                src={image}
                                                alt=""
                                                className="w-20 h-20 object-cover mt-2"
                                            />
                                            <i
                                                className="ri-delete-bin-line"
                                                onClick={() => deleteImage(image)}
                                            ></i>
                                        </div>
                                    ))}
                                </div>
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={(info) => setFile(info.file)}
                                    listType="picture"
                                >
                                    <Button type="dashed">Upload Images</Button>
                                </Upload>
                                <div className="flex justify-end mt-4 gap-5">
                                    <Button type="default" onClick={() => setShowTaskForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" onClick={uploadImage} disabled={!file}>
                                        Upload
                                    </Button>
                                </div>
                            </>
                        ),
                    },
                ]}
            />
        </Modal>)
}

export default TaskForm