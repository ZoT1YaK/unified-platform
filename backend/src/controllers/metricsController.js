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
      .text(`Total tasks: ${snapshot.total_tasks}`)
      .text(`Completed tasks: ${snapshot.completed_tasks}`)
      .text(`Total Achievements: ${snapshot.total_achievements}`)
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

//-------------------------------- PowerBI --------------------------------//

exports.generateMonthlyPowerBIReport = async () => {
  console.log("Generating monthly Power BI reports...");

  try {
    const leaders = await Employee.find({ is_people_leader: true }).select("_id email");

    for (const leader of leaders) {
      try {
        const reportPath = await generatePowerBIReportForLeader(leader._id);
        console.log(`Power BI Report generated for Leader: ${leader.email} at ${reportPath}`);
      } catch (error) {
        console.error(`Error generating Power BI report for leader ${leader.email}:`, error);
      }
    }

    console.log("Monthly Power BI reports generated successfully.");
  } catch (error) {
    console.error("Error generating monthly Power BI reports:", error);
  }
};

exports.generateManualPowerBIReport = async (req, res) => {
  const { id } = req.user;

  try {
    const reportPath = await generatePowerBIReportForLeader(id);
    res.status(201).json({
      message: "Power BI report generated successfully.",
      reportPath,
    });
  } catch (error) {
    console.error("Error generating manual Power BI report:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const generatePowerBIReportForLeader = async (leaderId) => {
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
    acc[emp._id.toString()] = emp.email;
    return acc;
  }, {});

  const snapshots = await MetricsSnapshot.find({ emp_id: { $in: employeeIds } });

  if (!snapshots.length) {
    throw new Error("No metrics data found for the leader's employees.");
  }

  const csvFields = [
    "Employee Email",
    "Task Completion Rate",
    "Average Task Speed (days)",
    "Milestones Achieved",
    "Engagement Score",
    "Start Date",
    "End Date",
  ];

  const csvData = snapshots.map((snapshot) => ({
    "Employee Email": employeeEmailsMap[snapshot.emp_id?.toString()] || "N/A",
    "Task Completion Rate": `${snapshot.task_completion_rate.toFixed(2)}%`,
    "Average Task Speed (days)": snapshot.average_task_speed.toFixed(2),
    "Milestones Achieved": snapshot.milestones_achieved,
    "Engagement Score": snapshot.engagement_score.toFixed(2),
    "Start Date": snapshot.start_date.toISOString(),
    "End Date": snapshot.end_date.toISOString(),
  }));

  const json2csvParser = new Parser({ fields: csvFields });
  const csv = json2csvParser.parse(csvData);

  const reportsDir = path.resolve(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFilePath = path.join(reportsDir, `power_bi_report_${leaderId}_${Date.now()}.csv`);
  fs.writeFileSync(reportFilePath, csv);

  return reportFilePath;
};

exports.downloadPowerBIReport = async (req, res) => {
  const { report_path } = req.params;

  try {
    if (!fs.existsSync(report_path)) {
      return res.status(404).json({ message: "File not found." });
    }

    res.download(report_path, (err) => {
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