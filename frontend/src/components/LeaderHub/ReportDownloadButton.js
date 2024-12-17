import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportViewer = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/metrics/reports?start_date=2024-01-01&end_date=2024-12-31`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setReports(response.data.reports);
        if (response.data.reports.length) {
          setSelectedReport(response.data.reports[0].reportId);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert("Failed to fetch reports.");
      }
    };

    fetchReports();
  }, []);

  const handleViewReport = async () => {
    if (!selectedReport) {
      alert("Please select a report to view.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report/download/${selectedReport}`,
        {
          responseType: "blob", 
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const fileUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setPdfUrl(fileUrl);
      setIsModalOpen(true); 
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch report.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPdfUrl(null); 
  };

  return (
    <div>
      <label htmlFor="reportDropdown">Select Report:</label>
      <select
        id="reportDropdown"
        value={selectedReport}
        onChange={(e) => setSelectedReport(e.target.value)}
        style={{ margin: "10px" }}
      >
        {reports.map((report) => (
          <option key={report.reportId} value={report.reportId}>
            {new Date(report.reportDate).toLocaleDateString()}
          </option>
        ))}
      </select>

      <button onClick={handleViewReport} disabled={isLoading || !selectedReport} style={styles.button}>
        {isLoading ? "Loading..." : "View Report"}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} style={styles.closeButton}>
              &times;
            </button>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                title="Metrics Report"
                style={styles.iframe}
                frameBorder="0"
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    position: "relative",
    width: "80%",
    height: "80%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
};

export default ReportViewer;
