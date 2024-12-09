const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const Task = require("../models/Task");
const Milestone = require("../models/Milestone");
const Employee = require("../models/Employee");
const MetricsSnapshot = require("../models/MetricsSnapshot");
const MetricsReport = require("../models/MetricsReport");
const NotificationController = require("./notificationController");
const NotificationType = require("../models/NotificationType");

exports.updateDailyMetricsSnapshot = async () => {
  const startOfMonth = new Date(new Date().setDate(1)); // First day of the current month
  const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)); // First day of the next month

  try {
    const employees = await Employee.find(); // Get all employees or filter as needed

    for (const employee of employees) {
      const metrics = await calculateMetricsData({
        emp_id: employee._id,
        start_date: startOfMonth.toISOString(),
        end_date: new Date().toISOString(), 
      });

      const existingSnapshot = await MetricsSnapshot.findOne({
        emp_id: employee._id,
        start_date: startOfMonth,
        end_date: endOfMonth,
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
          snapshot_date: new Date(),
          start_date: startOfMonth,
          end_date: endOfMonth,
        });
      }
    }

    console.log("Daily metrics snapshots updated successfully.");
  } catch (error) {
    console.error("Error updating daily metrics snapshots:", error);
  }
};

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
  const employeeEmailsMap = leaderEmployees.reduce((acc, emp) => {
    acc[emp._id.toString()] = emp.email; // Map emp_id to email for lookup
    return acc;
  }, {});

  const snapshots = await MetricsSnapshot.find({ emp_id: { $in: employeeIds } });

  if (!snapshots.length) {
    throw new Error("No metrics data found for the leader's employees.");
  }

  const reportFilePath = path.resolve(
    __dirname,
    `../reports/metrics_report_${leaderId}_${Date.now()}.pdf`
  );

  const doc = new PDFDocument();
  const reportsDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const writeStream = fs.createWriteStream(reportFilePath);
  doc.pipe(writeStream);

  doc
    .fontSize(20)
    .text("Metrics Report", { align: "center" })
    .moveDown();

  doc
    .fontSize(14)
    .text(`Generated for People Leader: ${leader.email}`, { align: "left" })
    .moveDown();

  snapshots.forEach((snapshot, index) => {
    const email = employeeEmailsMap[snapshot.emp_id?.toString()] || "N/A";

    doc
      .fontSize(12)
      .text(`Snapshot #${index + 1}:`, { underline: true })
      .moveDown(0.5)
      .text(`Employee Email: ${email}`)
      .text(`Task Completion Rate: ${snapshot.task_completion_rate.toFixed(2)}%`)
      .text(`Average Task Speed: ${snapshot.average_task_speed.toFixed(2)} days`)
      .text(`Milestones Achieved: ${snapshot.milestones_achieved}`)
      .text(`Engagement Score: ${snapshot.engagement_score.toFixed(2)}`)
      .moveDown();
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", async () => {
      const report = await MetricsReport.create({
        generated_for: leaderId,
        report_date: new Date(),
        file_path: reportFilePath,
        status: "Sent",
      });

      const notificationType = await NotificationType.findOne({
        type_name: "Report Available",
      });

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

    writeStream.on("error", (err) => {
      console.error("Error writing PDF file:", err);
      reject(new Error("Error generating PDF file."));
    });
  });
};

exports.downloadMetricsReport = async (req, res) => {
  const { report_id } = req.params;
  
  try {
    const report = await MetricsReport.findById(report_id);
  
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }
  
    const filePath = report.file_path;
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found." });
    }
  
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file." });
      }
    });
  } catch (error) {
    console.error("Error fetching report for download:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const calculateMetricsData = async ({ emp_id, team_id, start_date, end_date }) => {
  const filter = {
    ...(emp_id && { assigned_to_id: new mongoose.Types.ObjectId(emp_id) }),
    ...(team_id && { assigned_to_team_id: new mongoose.Types.ObjectId(team_id) }),
    created_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
  };

  const metrics = await Task.aggregate([
    { $match: filter },
    {
      $group: {
        _id: new mongoose.Types.ObjectId(emp_id || team_id),
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
      $addFields: {
        milestonesAchieved: { $size: "$milestones" },
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
      $project: {
        _id: 0,
        id: "$_id",
        taskCompletionRate: 1,
        averageTaskSpeed: 1,
        milestonesAchieved: 1,
        engagementScore: 1,
      },
    },
  ]);

  if (!metrics.length) {
    throw new Error("No metrics found for the given parameters.");
  }

  return metrics[0];
};