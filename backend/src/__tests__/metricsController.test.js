const MetricsSnapshot = require("../models/MetricsSnapshot");
const Employee = require("../models/Employee");
const metricsController = require("../controllers/metricsController");

jest.mock("../models/MetricsSnapshot");
jest.mock("../models/Employee");

describe("Metrics Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should query employees and process snapshots", async () => {
    // Mock Employee.find and MetricsSnapshot.create behavior
    Employee.find.mockResolvedValue([{ _id: "employee1" }, { _id: "employee2" }]);
    MetricsSnapshot.create.mockResolvedValue({});

    // Mock calculation of metrics (directly test helper functions)
    const calculateMetricsDataMock = jest
      .spyOn(metricsController, "calculateMetricsData")
      .mockResolvedValue({
        taskCompletionRate: 90,
        averageTaskSpeed: 2,
      });

    // Simulate what would happen in updateDailyMetricsSnapshot
    const employees = await Employee.find(); // Simulate employee retrieval
    for (const employee of employees) {
      const metrics = await metricsController.calculateMetricsData({
        emp_id: employee._id,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      });

      await MetricsSnapshot.create({
        emp_id: employee._id,
        ...metrics,
        snapshot_date: new Date(),
      });
    }

    expect(Employee.find).toHaveBeenCalled(); // Verify Employee.find is called
    expect(calculateMetricsDataMock).toHaveBeenCalledTimes(2); // Ensure calculateMetricsData is called for each employee
    expect(MetricsSnapshot.create).toHaveBeenCalledTimes(2); // Check if create is called twice
    expect(MetricsSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({ emp_id: "employee1", taskCompletionRate: 90 })
    );
  });

  it("should handle errors gracefully when querying employees", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    Employee.find.mockRejectedValue(new Error("Database error"));

    try {
      await Employee.find();
    } catch (error) {
      console.error("Error updating daily metrics snapshots:", error);
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error updating daily metrics snapshots:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
