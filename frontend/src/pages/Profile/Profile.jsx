import React from "react";
import { Tabs } from "antd";
import Projects from "./Projects/Projects";
import GeneralInfo from "./General/GeneralInfo";
import "./Profile.css";


const Profile = () => {
    return (
        <div className="profile-container">
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        label: "Projects",
                        key: "1",
                        children: <Projects />,
                    },
                    {
                        label: "General",
                        key: "2",
                        children: <GeneralInfo />,
                    },
                ]}
            />
        </div>
    )
}
export default Profile