import React from "react";
import { useParams } from "react-router-dom";
import Achievements from "../Achievements/Achievements";
import Milestones from "../Milestones/Milestones";
import EmployeeDetails from "../EmployeeDetails/EmployeeDetails";
import TopBar from "../TopBar/TopBar";
import Header from "../Header/Header";
import Analytics from "../Analytics/Analytics";
import PostHistory from "../PostHistory/PostHistory";
import "./VisitedProfPage.css"

const VisitedProfile = () => {
    const { empId } = useParams();

    console.log("empId in VisitedProfile:", empId); // Log the empId.

    return (
        <div className="visited-profile-page">
            <TopBar />
            <Header />
            <div className="visited-prof-active-area">
                <div className="visited-prof-employee-column">
                    <EmployeeDetails empId={empId} mode="visited" />
                    <Analytics empId={empId} />
                    <PostHistory empId={empId} />
                </div>
                <div className="visited-prof-achmil-column">
                    <Achievements empId={empId} mode="visited" simpleMode={true} />
                    <Milestones empId={empId} mode="visited" simpleMode={true} />
                </div>
            </div>
        </div>
    );
};

export default VisitedProfile;
