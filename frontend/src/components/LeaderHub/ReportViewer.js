import React, { useState, useEffect, useCallback } from "react";
import { fetchReports, downloadReport, generateReport } from "../../services/metricsService";
import "./ReportViewer.css";

const ReportViewer = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const token = localStorage.getItem("token");

  const loadReports = useCallback(async () => {
    try {
      const reportsList = await fetchReports(token);
      setReports(reportsList);
      if (reportsList.length) setSelectedReport(reportsList[0].reportId);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to fetch reports.");
    }
  }, [token]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleViewReport = async () => {
    if (!selectedReport) return alert("Please select a report to view.");

    setIsLoading(true);
    try {
      const reportBlob = await downloadReport(token, selectedReport);
      const fileUrl = URL.createObjectURL(new Blob([reportBlob], { type: "application/pdf" }));
      setPdfUrl(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateReport(token);
      alert("Report generated successfully. Refreshing reports list...");
      await loadReports();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPdfUrl(null);
  };

  return (
    <div className="report-viewer">
      <div className="controls">
        <label htmlFor="reportDropdown">Select Report:</label>
        <select
          id="reportDropdown"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="report-select"
        >
          {reports.map((report) => (
            <option key={report.reportId} value={report.reportId}>
              {new Date(report.reportDate).toLocaleDateString()}
            </option>
          ))}
        </select>

        <button
          onClick={handleViewReport}
          disabled={isLoading || !selectedReport}
          className="button"
        >
          {isLoading ? "Loading..." : "View Report"}
        </button>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="button generate-button"
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="close-button">
              &times;
            </button>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                title="Metrics Report"
                className="report-iframe"
                frameBorder="0"
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;
