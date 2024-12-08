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

exports.calculateMetrics = async (req, res) => {
  const { emp_id, team_id, start_date, end_date } = req.query;

  try {
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Start and end dates are required." });
    }

    const filter = {
      ...(emp_id && { assigned_to_id: new mongoose.Types.ObjectId(emp_id) }),
      ...(team_id && { assigned_to_team_id: new mongoose.Types.ObjectId(team_id) }),
      completion_date: { $gte: new Date(start_date), $lte: new Date(end_date) },
    };

    const metrics = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: emp_id || team_id,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          averageTaskSpeed: {
            $avg: { $subtract: ["$completion_date", "$created_date"] },
          },
        },
      },
      {
        $lookup: {
          from: "milestones",
          localField: "_id",
          foreignField: emp_id ? "emp_id" : "team_id",
          as: "milestones",
        },
      },
      {
        $addFields: {
          milestonesAchieved: { $size: "$milestones" },
          taskCompletionRate: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
            ],
          },
          engagementScore: {
            $divide: [
              { $add: ["$completedTasks", { $size: "$milestones" }] },
              10, // Example: activity_weight = 10
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
      return res.status(404).json({ message: "No metrics found for the given parameters." });
    }

    res.status(200).json({ metrics: metrics[0] });
  } catch (error) {
    console.error("Error calculating metrics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveMetricsSnapshot = async (req, res) => {
  const { emp_id, team_id, start_date, end_date } = req.query;

  try {
    const metrics = await this.calculateMetrics({ query: { emp_id, team_id, start_date, end_date } });

    await MetricsSnapshot.create({
      emp_id: emp_id || null,
      team_id: team_id || null,
      task_completion_rate: metrics.taskCompletionRate,
      average_task_speed: metrics.averageTaskSpeed,
      milestones_achieved: metrics.milestonesAchieved,
      engagement_score: metrics.engagementScore,
      snapshot_date: new Date(),
      start_date,
      end_date,
    });

    res.status(201).json({ message: "Metrics snapshot saved successfully." });
  } catch (error) {
    console.error("Error saving metrics snapshot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateMetricsReport = async (req, res) => {
  const { leader_id } = req.query;

  try {
    if (!leader_id) {
      return res.status(400).json({ message: "Leader ID is required." });
    }

    const snapshots = await MetricsSnapshot.find({
      emp_id: { $in: await getLeaderEmployees(leader_id) },
    });

    if (!snapshots.length) {
      return res.status(404).json({ message: "No metrics data found for the leader." });
    }

    const reportFilePath = path.resolve(
      __dirname,
      `../reports/metrics_report_${leader_id}_${Date.now()}.pdf`
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
      .text(`Generated for Leader ID: ${leader_id}`)
      .moveDown();

    snapshots.forEach((snapshot, index) => {
      doc
        .fontSize(12)
        .text(`Snapshot #${index + 1}:`, { underline: true })
        .moveDown(0.5)
        .text(`Employee/Team ID: ${snapshot.emp_id || snapshot.team_id}`)
        .text(`Task Completion Rate: ${snapshot.task_completion_rate.toFixed(2)}%`)
        .text(`Average Task Speed: ${snapshot.average_task_speed.toFixed(2)} days`)
        .text(`Milestones Achieved: ${snapshot.milestones_achieved}`)
        .text(`Engagement Score: ${snapshot.engagement_score.toFixed(2)}`)
        .moveDown();
    });

    doc.end();

    writeStream.on("finish", async () => {
      const report = await MetricsReport.create({
        generated_for: leader_id,
        report_date: new Date(),
        file_path: reportFilePath,
        status: "Generated",
      });

      const notificationType = await NotificationType.findOne({
        type_name: "Report Available",
      });

      if (!notificationType) {
        return res.status(404).json({ message: "Notification type not found." });
      }

      await NotificationController.createNotification({
        recipient_id: leader_id,
        noti_type_id: notificationType._id,
        related_entity_id: report._id,
        message: "Your monthly metrics report is now available.",
      });

      res.status(201).json({
        message: "Metrics report generated successfully.",
        report,
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF file:", err);
      res.status(500).json({ message: "Error generating PDF file." });
    });
  } catch (error) {
    console.error("Error generating metrics report:", error);
    res.status(500).json({ message: "Server error" });
  }
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

const getLeaderEmployees = async (leader_id) => {
  const employees = await Employee.find({ people_leader_id: leader_id }).select("_id");
  return employees.map((emp) => emp._id);
};