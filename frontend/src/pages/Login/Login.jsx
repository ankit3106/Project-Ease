import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link } from "react-router-dom";
import Divider from "../../components/Divider";
import { LoginUser } from "../../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetButtonLoading } from "../../redux/loadersSlice";
import { getAntdFormInputRules } from "../../utils/helpers";
import "./Login.css";

const Login = () => {

    const { buttonLoading } = useSelector((state) => state.loaders);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(SetButtonLoading(true));
            const response = await LoginUser(values);
            dispatch(SetButtonLoading(false));
            if (response.success) {
                localStorage.setItem("token", response.data.token); // <-- Save the token correctly
                message.success(response.message);
                window.location.href = "/";
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
            window.location.href = "/";
        }
    }, []);

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-form-title">Project-Ease</h1>
                <span style={{ textAlign: "center", color: "#2c3e50", marginBottom: 8 }}>
                    One place to track all your business records
                </span>
                <Divider className="login-divider" />
                <Form layout="vertical" onFinish={onFinish} className="login-form">
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
                        className="login-button"
                    >
                        {buttonLoading ? "Loading" : "Login"}
                    </Button>
                    <div className="login-link">
                        <span>Don't have an account?</span>
                        <Link to="/register">Register</Link>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default Login