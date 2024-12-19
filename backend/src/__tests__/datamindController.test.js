const Datamind = require("../models/Datamind");
const datamindController = require("../controllers/datamindController");
const xlsx = require("xlsx");

jest.mock("../models/Datamind");

describe("Datamind Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadDatamind", () => {
    it("should upload Datamind values from a valid Excel file", async () => {
      const mockSheetData = [
        { data_mind_type: "DataMind Type 1" },
        { data_mind_type: "DataMind Type 2" },
      ];
    
      jest.spyOn(xlsx, "readFile").mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {
          Sheet1: {},
        },
      });
      jest.spyOn(xlsx.utils, "sheet_to_json").mockReturnValue(mockSheetData);
    
      Datamind.insertMany.mockResolvedValueOnce([]);
    
      const req = {
        file: {
          path: "/path/to/excel.xlsx",
        },
        user: { id: "creator_id" }, // Include creator ID
      };
    
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await datamindController.uploadDatamind(req, res);
    
      expect(Datamind.insertMany).toHaveBeenCalledWith(
        mockSheetData.map((data) => ({
          data_mind_type: data.data_mind_type,
          created_by_id: "creator_id", // Check for created_by_id
        })),
        { ordered: false }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Datamind values uploaded successfully.",
      });
    });
    
    it("should handle missing file upload", async () => {
      const req = { file: null, user: { id: "creator_id" } }; // Add user mock
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await datamindController.uploadDatamind(req, res);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded." });
    });

    it("should handle errors during Datamind upload", async () => {
      const mockSheetData = [{ data_mind_type: "DataMind Type 1" }];

      jest.spyOn(xlsx, "readFile").mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: {
          Sheet1: {},
        },
      });
      jest.spyOn(xlsx.utils, "sheet_to_json").mockReturnValue(mockSheetData);

      Datamind.insertMany.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        file: {
          path: "/path/to/excel.xlsx",
        },
        user: { id: "creator_id" },
      };

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await datamindController.uploadDatamind(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getAllDatamind", () => {
    it("should fetch all Datamind values", async () => {
      const mockDataMinds = [
        { _id: "datamind1", data_mind_type: "Type 1" },
        { _id: "datamind2", data_mind_type: "Type 2" },
      ];

      Datamind.find.mockResolvedValueOnce(mockDataMinds);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await datamindController.getAllDatamind(req, res);

      expect(Datamind.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ dataMinds: mockDataMinds });
    });

    it("should handle errors during Datamind retrieval", async () => {
      Datamind.find.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await datamindController.getAllDatamind(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("resetDatamind", () => {
    it("should reset all Datamind values", async () => {
      Datamind.deleteMany.mockResolvedValueOnce({ deletedCount: 10 });

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await datamindController.resetDatamind(req, res);

      expect(Datamind.deleteMany).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "All Datamind values have been reset." });
    });

    it("should handle errors during Datamind reset", async () => {
      Datamind.deleteMany.mockRejectedValueOnce(new Error("Database error"));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await datamindController.resetDatamind(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
