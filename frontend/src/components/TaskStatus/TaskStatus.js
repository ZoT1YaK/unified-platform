import React from "react";
import "./TaskStatus.css";

const TaskStatus = ({ totalTasks, completedTasks, uncompletedTasks }) => {
    const completedPercentage = totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return (
        <div className="task-status">
            <h2>Task Status Overview</h2>
            <div className="circle-container">
                <svg className="progress-ring" viewBox="0 0 36 36">
                    <path
                        className="progress-ring__background"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="progress-ring__progress"
                        strokeDasharray={`${completedPercentage}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="progress-text">
                    <span className="completed">{completedTasks}</span>
                    <span className="out-of">out of {totalTasks}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskStatus;
