import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../api";

function Home() {
  const [documentCount, setDocumentCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [depts, templates, docs] = await Promise.all([
          fetchAPI('/api/departments'),
          fetchAPI('/api/templates'),
          fetchAPI('/api/documents'),
        ]);

        // Use the correct response keys from your backend
        setDepartmentCount(depts.departments?.length || 0);
        setTemplateCount(templates.templates?.length || 0);
        setDocumentCount(docs.documents?.length || 0);

      } catch (err) {
        console.error("API ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <>
      <Breadcrumb />
      <h1>Welcome back</h1>
      <p className="subtitle">
        Manage templates, generate documents and keep records organized.
      </p>

      <div className="stats-grid">
        <div className="card" onClick={() => navigate("/departments")}>
          <h2>{departmentCount}</h2>
          <p>Departments</p>
        </div>
        <div className="card" onClick={() => navigate("/templates")}>
          <h2>{templateCount}</h2>
          <p>Document Types</p>
        </div>
        <div className="card" onClick={() => navigate("/history")}>
          <h2>{documentCount}</h2>
          <p>Generated Documents</p>
        </div>
      </div>

      <div className="card action-box">
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          <div className="quick-card" onClick={() => navigate("/generate-document")}>
            Generate a Document
          </div>
          <div className="quick-card" onClick={() => navigate("/departments")}>
            Browse Departments
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;