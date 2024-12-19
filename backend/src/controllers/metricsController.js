const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const Task = require("../models/Task");
const Milestone = require("../models/Milestone");
const Employee = require("../models/Employee");
const MetricsSnapshot = require("../models/MetricsSnapshot");
const MetricsReport = require("../models/MetricsReport");
const NotificationController = require("./notificationController");
const NotificationType = require("../models/NotificationType");
const EventEmployee = require("../models/EventEmployee");
const Event = require ("../models/Event");
const { getGridFsBucket  } = require("../config/db");

/**
 * @desc    Update daily metrics snapshots for all employees.
 *          - Calculates task completion rate, milestones achieved, engagement score, etc.
 *          - Updates or creates a snapshot for the current month.
 * @access  Internal (Used within the server, no public route)
 */
exports.updateDailyMetricsSnapshot = async () => {
  const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)); // First day of the next month
  endOfMonth.setHours(0, 0, 0, 0); 

  try {
    const employees = await Employee.find(); // Get all employees or filter as needed

    for (const employee of employees) {
      const metrics = await calculateMetricsData({
        emp_id: employee._id,
        start_date: startOfMonth.toISOString(),
        end_date: new Date().toISOString(), 
      });

      // Normalize start and end dates in the query to ensure proper comparison
      const existingSnapshot = await MetricsSnapshot.findOne({
        emp_id: employee._id,
        start_date: startOfMonth.toISOString(),
        end_date: endOfMonth.toISOString(),
      });

      if (existingSnapshot) {
        await MetricsSnapshot.updateOne(
          { _id: existingSnapshot._id },
          {
            $set: {
              task_completion_rate: metrics.taskCompletionRate,
              average_task_speed: metrics.averageTaskSpeed,
              milestones_achieved: metrics.milestonesAchieved,
              engagement_score: metrics.engagementScore,
              total_tasks: metrics.totalTasks,
              completed_tasks: metrics.completedTasks,
              total_achievements: metrics.totalAchievements,
              snapshot_date: new Date(),
            },
          }
        );
      } else {
        await MetricsSnapshot.create({
          emp_id: employee._id,
          task_completion_rate: metrics.taskCompletionRate,
          average_task_speed: metrics.averageTaskSpeed,
          milestones_achieved: metrics.milestonesAchieved,
          engagement_score: metrics.engagementScore,
          total_tasks: metrics.totalTasks,
          completed_tasks: metrics.completedTasks,
          total_achievements: metrics.totalAchievements,
          snapshot_date: new Date(),
          start_date: startOfMonth.toISOString(),
          end_date: endOfMonth.toISOString(),
        });
      }
    }

    console.log("Daily metrics snapshots updated successfully.");
  } catch (error) {
    console.error("Error updating daily metrics snapshots:", error);
  }
};

/**
 * @desc    Fetch metrics reports by a specified date range for the logged-in People Leader.
 * @route   GET /api/metrics/reports
 * @access  Private (People Leaders only)
 */
exports.getReportsByDate = async (req, res) => {
  const { id } = req.user;
  const { start_date, end_date } = req.query;

  try {
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Start date and end date are required." });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const reports = await MetricsReport.find({
      generated_for: id,
      report_date: { $gte: startDate, $lte: endDate },
    }).select("_id report_date generated_for");

    if (!reports.length) {
      return res.status(404).json({ message: "No reports found for the specified date range." });
    }

    const formattedReports = reports.map((report) => ({
      reportId: report._id,
      reportDate: report.report_date.toISOString(),
      generatedFor: report.generated_for,
    }));

    res.status(200).json({ reports: formattedReports });
  } catch (error) {
    console.error("Error fetching reports by date:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Generate a manual metrics report for the logged-in People Leader.
 * @route   POST /api/metrics/report
 * @access  Private (People Leaders only)
 */
exports.generateManualMetricsReport = async (req, res) => {
  const { id } = req.user;

  try {
    const report = await generateMetricsReportForLeader(id);
    res.status(201).json({
      message: "Metrics report generated successfully.",
      report,
    });
  } catch (error) {
    console.error("Error generating manual metrics report:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Generate monthly metrics reports for all People Leaders.
 *          - Generates PDF reports and sends notifications for availability.
 * @access  Internal (Used within the server, no public route)
 */
exports.generateMonthlyMetricsReports = async () => {
  console.log("Generating monthly metrics reports...");

  try {
    const leaders = await Employee.find({ is_people_leader: true }).select("_id");

    for (const leader of leaders) {
      try {
        await generateMetricsReportForLeader(leader._id);
      } catch (error) {
        console.error(`Error generating report for leader ${leader._id}:`, error);
      }
    }

    console.log("Monthly metrics reports generated successfully.");
  } catch (error) {
    console.error("Error generating monthly metrics reports:", error);
  }
};

const generateMetricsReportForLeader = async (leaderId) => {
  const leader = await Employee.findById(leaderId).select("email");
  if (!leader) {
    throw new Error("Leader not found.");
  }

  const leaderEmployees = await Employee.find({ people_leader_id: leaderId }).select("_id email");
  if (!leaderEmployees.length) {
    throw new Error("No employees found for this leader.");
  }

  const employeeIds = leaderEmployees.map((emp) => emp._id);
  const snapshots = await MetricsSnapshot.find({ emp_id: { $in: employeeIds } });

  if (!snapshots.length) {
    throw new Error("No metrics data found for the leader's employees.");
  }

  const doc = new PDFDocument();
  const gridFsBucket = getGridFsBucket();

  const uploadStream = gridFsBucket.openUploadStream(`metrics_report_${leaderId}_${Date.now()}.pdf`, {
    metadata: { generatedFor: leaderId },
  });

  doc.pipe(uploadStream);

  doc.fontSize(20).text("Metrics Report", { align: "center" }).moveDown();
  doc.fontSize(14).text(`Generated for: ${leader.email}`).moveDown();

  snapshots.forEach((snapshot, index) => {
    doc
      .fontSize(12)
      .text(`Snapshot #${index + 1}:`)
      .text(`Task Completion Rate: ${snapshot.task_completion_rate.toFixed(2)}%`)
      .text(`Average Task Speed: ${snapshot.average_task_speed.toFixed(2)} days`)
      .text(`Milestones Achieved: ${snapshot.milestones_achieved}`)
      .text(`Engagement Score: ${snapshot.engagement_score.toFixed(2)}`)
      .moveDown();
  });

  doc.end();

  return new Promise((resolve, reject) => {
    uploadStream.on("finish", async () => {
      
        // Retrieve the file metadata from the reports.files collection
        const file = await gridFsBucket
          .find({ _id: uploadStream.id })
          .next();
          
        if (!file || !file._id) {
          throw new Error("File metadata is undefined or invalid.");
        }
    
        const report = await MetricsReport.create({
          generated_for: leaderId,
          report_date: new Date(),
          file_id: file._id,
          status: "Sent",
        });
    
        const notificationType = await NotificationType.findOne({ type_name: "Report Available" });
        
        if (notificationType) {
          await NotificationController.createNotification({
            recipient_id: leaderId,
            noti_type_id: notificationType._id,
            related_entity_id: report._id,
            message: "Your monthly metrics report is now available.",
          });
        }
        resolve(report);
    });

    uploadStream.on("error", (err) => {
      console.error("Error uploading PDF to GridFS:", err);
      reject(err);
    });
  });
};

/**
 * @desc    Download a specific metrics report.
 * @route   GET /api/metrics/report/download/:report_id
 * @access  Private (Requires token validation)
 */
exports.downloadMetricsReport = async (req, res) => {
  const { report_id } = req.params;

  try {
    const report = await MetricsReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    const gridFsBucket = getGridFsBucket();
    const downloadStream = gridFsBucket.openDownloadStream(report.file_id);

    downloadStream.on("data", (chunk) => res.write(chunk));
    downloadStream.on("end", () => res.end());
    downloadStream.on("error", (err) => {
      console.error("Error downloading file from GridFS:", err);
      res.status(500).json({ message: "Error downloading report." });
    });
  } catch (error) {
    console.error("Error fetching report for download:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Fetch metrics data for employees reporting to the logged-in People Leader.
 *          - Returns metrics such as task completion rate, average task speed, and achievements.
 * @route   GET /api/metrics/metrics
 * @access  Private (People Leaders only)
 */
exports.getMetricsByPeopleLeader = async (req, res) => {
  const { id } = req.user;

  try {
    const leaderEmployees = await Employee.find({ people_leader_id: id }).select("_id f_name l_name email img_link");
    if (!leaderEmployees.length) {
      return res.status(404).json({ message: "No employees found for this leader." });
    }

    const employeeIds = leaderEmployees.map((emp) => emp._id);
    const snapshots = await MetricsSnapshot.find({ emp_id: { $in: employeeIds } });

    if (!snapshots.length) {
      return res.status(404).json({ message: "No metrics data found for the leader's employees." });
    }

    const metrics = snapshots.map((snapshot) => {
      const employee = leaderEmployees.find((emp) => emp._id.toString() === snapshot.emp_id.toString());
      return {
        employeeName: `${employee?.f_name || "N/A"} ${employee?.l_name || ""}`,
        employeeEmail: employee?.email || "N/A",
        img_link: employee?.img_link || "/placeholder.png",
        taskCompletionRate: snapshot.task_completion_rate,
        averageTaskSpeed: snapshot.average_task_speed,
        milestonesAchieved: snapshot.milestones_achieved,
        engagementScore: snapshot.engagement_score,
        totalTasks: snapshot.total_tasks,
        completedTasks: snapshot.completed_tasks,
        totalAchievements: snapshot.total_achievements,
      };
    });

    res.status(200).json({ metrics });
  } catch (error) {
    console.error("Error fetching metrics by People Leader:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const calculateMetricsData = async ({ emp_id, start_date, end_date }) => {
  const filter = {
    ...(emp_id && { assigned_to_id: new mongoose.Types.ObjectId(emp_id) }),
    created_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
  };

  const metrics = await Task.aggregate([
    { $match: filter },
    {
      $group: {
        _id: new mongoose.Types.ObjectId(emp_id),
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
        averageTaskSpeed: {
          $avg: {
            $cond: [
              { $eq: ["$status", "Completed"] },
              {
                $divide: [
                  { $subtract: ["$completion_date", "$created_date"] },
                  1000 * 60 * 60 * 24, // Convert to days
                ],
              },
              null,
            ],
          },
        },
      },
    },
    {
      // Ensure default values
      $addFields: {
        taskCompletionRate: { $ifNull: ["$taskCompletionRate", 0] }, 
        averageTaskSpeed: { $ifNull: ["$averageTaskSpeed", 0] },
        milestonesAchieved: { $ifNull: ["$milestonesAchieved", 0] },
        engagementScore: { $ifNull: ["$engagementScore", 0] },
        totalAchievements: { $ifNull: ["$totalAchievements", 0] },
        totalTasks: { $ifNull: ["$totalTasks", 0] },
        completedTasks: { $ifNull: ["$completedTasks", 0] },
      },
    },
    {
      $lookup: {
        from: "milestones",
        localField: "_id",
        foreignField: "emp_id",
        as: "milestones",
      },
    },
    {
      $lookup: {
        from: "achievements",
        localField: "_id",
        foreignField: "emp_id",
        as: "achievements",
      },
    },
    {
      $addFields: {
        milestonesAchieved: { $size: "$milestones" },
        totalAchievements: { $size: "$achievements" },
        taskCompletionRate: {
          $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100],
        },
        engagementScore: {
          $divide: [
            { $add: ["$completedTasks", { $size: "$milestones" }] },
            10, // Example activity weight
          ],
        },
      },
    },
    {
      $addFields: {
        taskCompletionRate: { $round: ["$taskCompletionRate", 2] },
        averageTaskSpeed: { $round: ["$averageTaskSpeed", 2] },
        engagementScore: { $round: ["$engagementScore", 2] },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        totalTasks: 1,
        completedTasks: 1,
        taskCompletionRate: 1,
        averageTaskSpeed: 1,
        milestonesAchieved: 1,
        totalAchievements: 1,
        engagementScore: 1,
      },
    },
  ]);

  if (!metrics.length) {
    throw new Error("No metrics found for the given parameters.");
  }

  return metrics[0];
};

exports.calculateMetricsData = calculateMetricsData;

exports.generateMetricsReportForLeader = generateMetricsReportForLeader;

//-------------------------------- ChartJS --------------------------------//
/**
 * @desc    Fetch task metrics for employees managed by the logged-in People Leader.
 *          - Aggregates task completion data and average speed.
 * @route   GET /api/metrics/team-tasks
 * @access  Private (People Leaders only)
 */
exports.getTeamTasksMetrics = async (req, res) => {
  const { id: leaderId } = req.user; // Leader's ID from authentication

  try {
    // Find employees who are not leaders and are under this leader
    const employees = await Employee.find({ 
      people_leader_id: leaderId, 
      is_people_leader: false // Ensure we exclude leaders
    }).select("_id f_name l_name");

    const employeeIds = employees.map((emp) => emp._id);

    // Aggregate tasks assigned to these employees
    const tasks = await Task.aggregate([
      { $match: { assigned_to_id: { $in: employeeIds } } },
      {
        $group: {
          _id: "$assigned_to_id", // Group by employee ID
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          averageTaskSpeed: {
            $avg: {
              $cond: [
                { $eq: ["$status", "Completed"] },
                { $divide: [{ $subtract: ["$completion_date", "$created_date"] }, 1000 * 60 * 60 * 24] },
                null,
              ],
            },
          },
        },
      },
    ]);

    // Map aggregated metrics to the corresponding employees
    const taskBreakdown = tasks.map((task) => {
      const employee = employees.find((emp) => emp._id.toString() === task._id.toString());
      return {
        employeeName: `${employee?.f_name || "N/A"} ${employee?.l_name || "N/A"}`,
        totalTasks: task.totalTasks,
        completedTasks: task.completedTasks,
        averageTaskSpeed: parseFloat(task.averageTaskSpeed || 0).toFixed(2), // Round to 2 decimal places
      };
    });

    res.status(200).json({ taskBreakdown });
  } catch (error) {
    console.error("Error fetching task metrics:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * @desc    Fetch event participation metrics for events created by the logged-in People Leader.
 *          - Groups events by participant responses (Accepted, Declined, Pending).
 * @route   GET /api/metrics/team-events
 * @access  Private (People Leaders only)
 */
exports.getTeamEventMetrics = async (req, res) => {
  const { id: leaderId } = req.user; // Extract People Leader ID

  try {
    // Fetch events created by the leader
    const events = await Event.find({ created_by_id: leaderId }).select("_id title");

    if (!events.length) {
      return res.status(404).json({ message: "No events found for this leader." });
    }

    const eventIds = events.map((event) => event._id);

    const eventResponses = await EventEmployee.find({ event_id: { $in: eventIds } }).select(
      "event_id response"
    );

    const responseBreakdown = {
      Accepted: [],
      Declined: [],
      Pending: [],
    };

    // Group event titles based on responses
    eventResponses.forEach((response) => {
      const event = events.find((event) => event._id.toString() === response.event_id.toString());
      if (event) {
        if (response.response === "Accepted") {
          responseBreakdown.Accepted.push(event.title);
        } else if (response.response === "Declined") {
          responseBreakdown.Declined.push(event.title);
        } else if (response.response === "Pending") {
          responseBreakdown.Pending.push(event.title);
        }
      }
    });

    res.status(200).json({
      totalEvents: events.length,
      responseBreakdown,
    });
  } catch (error) {
    console.error("Error fetching event metrics:", error);
    res.status(500).json({ message: "Server error." });
  }
};
