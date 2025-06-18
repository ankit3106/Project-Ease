import { Form, Input, message, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SetLoading } from "../../../redux/loadersSlice";
import { CreateProject, EditProject } from "../../../apicalls/projects";
import { socket } from "../../../socket";
import "./ProjectForm.css";

const ProjectForm = ({ show, setShow, reloadData, project }) => {

    const formRef = React.useRef(null);
    const { user } = useSelector((state) => state.users);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(SetLoading(true));
            let response = null;
            if (project) {
                // edit project
                values._id = project._id;
                response = await EditProject(values);
                socket.emit("project-updated", {
                    projectId: project._id,
                    updatedBy: user._id,
                    updatedData: values,
                });

            } else {
                // create project
                values.owner = user._id;
                values.members = [
                    {
                        user: user._id,
                        role: "owner",
                    },
                ];
                response = await CreateProject(values);

                socket.emit("project-created", {
                    projectId: response.data._id,
                    owner: user._id,
                    projectName: response.data.name,
                });

            }

            if (response.success) {
                message.success(response.message);
                reloadData();
                setShow(false);
            } else {
                throw new Error(response.error);
            }
            dispatch(SetLoading(false));
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    return (
        <Modal
            title={project ? "EDIT PROJECT" : "CREATE PROJECT"}
            open={show}
            onCancel={() => setShow(false)}
            centered
            width={700}
            onOk={() => {
                formRef.current.submit();
            }}
            okText="Save"
        >
            <Form
                layout="vertical"
                ref={formRef}
                onFinish={onFinish}
                initialValues={project}
                className="project-form-container"
            >
                <Form.Item
                    label="Project Name"
                    name="name"
                    className="project-form-label"
                    rules={[
                        { required: true, message: "Please enter the project name" },
                    ]}
                >
                    <Input
                        placeholder="Enter project name"
                        className="project-form-input"
                    />
                </Form.Item>
                <Form.Item
                    label="Project Description"
                    name="description"
                    className="project-form-label"
                    rules={[
                        { required: true, message: "Please enter the project description" },
                    ]}
                >
                    <TextArea
                        placeholder="Enter project description"
                        className="project-form-input"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ProjectForm