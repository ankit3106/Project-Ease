import { Form, Input, message, Modal } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { AddMemberToProject } from "../../../apicalls/projects";
import { SetLoading } from "../../../redux/loadersSlice";
import { getAntdFormInputRules } from "../../../utils/helpers";
import { socket } from "../../../socket";

const MemberForm = ({
    showMemberForm,
    setShowMemberForm,
    reloadData,
    project,
}) => {

    console.log(project.members);
    const formRef = React.useRef(null);
    const dispatch = useDispatch();
    const onFinish = async (values) => {
        try {
            const emailExists = project.members.find(
                (member) => member.user.email === values.email
            );
            if (emailExists) {
                throw new Error("User is already a member of this project");
            } else {
                dispatch(SetLoading(true));
                const response = await AddMemberToProject({
                    projectId: project._id,
                    email: values.email,
                    role: values.role,
                });
                dispatch(SetLoading(false));
                if (response.success) {
                    message.success(response.message);
                    // Emit socket event after successful addition
                    socket.emit("member-added", {
                        projectId: project._id,
                        member: response.data, // ensure your response contains the new member data
                    });
                    reloadData();
                    setShowMemberForm(false);
                } else {
                    message.error(response.message);
                }
            }
        } catch (error) {
            dispatch(SetLoading(false));
            message.error(error.message);
        }
    };

    return (
        <Modal
            title="ADD MEMBER"
            open={showMemberForm}
            onCancel={() => setShowMemberForm(false)}
            centered
            okText="Add"
            onOk={() => {
                formRef.current.submit();
            }}
        >
            <Form layout="vertical" ref={formRef} onFinish={onFinish}>
                <Form.Item label="Email" name="email" rules={getAntdFormInputRules}>
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item label="Role" name="role" rules={getAntdFormInputRules}>
                    <select>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Empolyee</option>
                    </select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default MemberForm