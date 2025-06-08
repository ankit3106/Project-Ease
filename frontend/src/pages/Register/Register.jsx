import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../../components/Divider";
import { RegisterUser } from "../../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetButtonLoading } from "../../redux/loadersSlice";
import { getAntdFormInputRules } from "../../utils/helpers";
import "./Register.css";


const Register = () => {

    const navigate = useNavigate();
    const { buttonLoading } = useSelector((state) => state.loaders);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(SetButtonLoading(true));
            const response = await RegisterUser(values);
            dispatch(SetButtonLoading(false));
            if (response.success) {
                message.success(response.message);
                navigate("/login");
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetButtonLoading(false));
            message.error(error.message);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/");
        }
    }, []);

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-form-title">Project-Ease</h1>
                <span style={{ textAlign: "center", color: "#2c3e50", marginBottom: 8 }}>
                    Please register your account to use our services.
                </span>
                <Divider className="register-divider" />
                <Form layout="vertical" onFinish={onFinish} className="register-form">
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={getAntdFormInputRules}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={getAntdFormInputRules}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={getAntdFormInputRules}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={getAntdFormInputRules}
                    >
                        <Input type="password" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={buttonLoading}
                        className="register-button"
                    >
                        {buttonLoading ? "Loading" : "Register"}
                    </Button>
                    <div className="register-link">
                        <span>Already have an account?</span>
                        <Link to="/login">Login</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Register