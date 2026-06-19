import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { fetchAPI } from "../api";

function History() {
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCount, setShowCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editPlaceholders, setEditPlaceholders] = useState({});
  const [editTemplate, setEditTemplate] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch documents, departments, and templates
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [docsRes, deptsRes, templatesRes] = await Promise.all([
          fetchAPI('/api/documents'),
          fetchAPI('/api/departments'),
          fetchAPI('/api/templates'),
        ]);
        setDocuments(docsRes.documents || []);
        setDepartments(deptsRes.departments || []);
        setTemplates(templatesRes.templates || []);
      } catch (err) {
        console.error("API ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || "Unknown";
  };

  const getTemplate = (templateId) => {
    return templates.find(t => t.id === templateId);
  };

  // Open edit modal with placeholder values
  const openEditModal = (doc) => {
    const template = getTemplate(doc.templateId);
    setEditTemplate(template);
    setEditingDoc(doc);
    
    let currentValues = {};
    try {
      currentValues = JSON.parse(doc.metadata || '{}');
    } catch {
      currentValues = {};
    }
    
    const placeholders = template?.placeholders || [];
    const initialValues = {};
    placeholders.forEach(ph => {
      initialValues[ph] = currentValues[ph] || '';
    });
    
    setEditPlaceholders(initialValues);
    setEditModalOpen(true);
  };

  // Regenerate document with updated values
  const handleRegenerate = async () => {
    if (!editingDoc) return;
    
    const emptyFields = Object.entries(editPlaceholders).filter(([_, v]) => !v.trim());
    if (emptyFields.length > 0) {
      alert(`Please fill all fields: ${emptyFields.map(([k]) => k).join(', ')}`);
      return;
    }
    
    setRegenerating(true);
    try {
      const res = await fetchAPI(`/api/documents/${editingDoc.id}/regenerate`, {
        method: 'POST',
        body: JSON.stringify({ values: editPlaceholders }),
      });
      
      setDocuments(documents.map(d => d.id === editingDoc.id ? res.document : d));
      setSuccessMsg(`Document "${res.document.documentName}" regenerated successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditModalOpen(false);
      setEditingDoc(null);
      setEditTemplate(null);
      setEditPlaceholders({});
    } catch (err) {
      console.error("Regenerate failed:", err);
      alert("Failed to regenerate document: " + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const documentTypes = [...new Set(documents.map((doc) => getTemplateName(doc.templateId)))];

  const filteredDocuments = documents.filter((doc) => {
    const templateName = getTemplateName(doc.templateId);
    
    const matchesSearch =
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "" || doc.department === selectedDepartment;

    const matchesType = selectedType === "" || templateName === selectedType;

    return matchesSearch && matchesDepartment && matchesType;
  });

  const deleteDocument = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.documentName}"?`)) return;
    
    try {
      await fetchAPI(`/api/documents/${doc.id}`, { method: 'DELETE' });
      setDocuments(documents.filter(d => d.id !== doc.id));
      setSuccessMsg("Document deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <p>Loading documents...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <>
      <Breadcrumb />
      <h1>Document History</h1>

      {successMsg && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '10px 15px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        <input
          className="search-box"
          placeholder="Search by document name, reference or department"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Reference Number</th>
            <th>Department</th>
            <th>Type</th>
            <th>Date</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.slice(0, showCount).map((doc) => (
              <tr key={doc.id}>
                <td>
                  <span
                    className="document-link"
                    onClick={() => setSelectedDocument(doc)}
                    style={{ cursor: 'pointer', color: '#007bff' }}
                  >
                    {doc.documentName}
                  </span>
                </td>
                <td>{doc.referenceNumber}</td>
                <td>{doc.department}</td>
                <td>{getTemplateName(doc.templateId)}</td>
                <td>{formatDate(doc.createdAt)}</td>
                
                {/* INLINE ACTION BUTTONS */}
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(doc)}
                      title="Edit / Regenerate"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #007bff',
                        background: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteDocument(doc)}
                      title="Delete"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #dc3545',
                        background: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      🗑️
                    </button>
                    
                    {/* Download Button */}
                    <a
                      href={`http://localhost:3000/api/documents/${doc.id}/download`}
                      download
                      title="Download PDF"
                      style={{ textDecoration: 'none' }}
                    >
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #28a745',
                          background: '#28a745',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        📄
                      </button>
                    </a>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show More/Less */}
      {filteredDocuments.length > 5 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {showCount < filteredDocuments.length ? (
            <button className="btn" onClick={() => setShowCount(showCount + 5)}>
              Show More
            </button>
          ) : (
            <button className="btn" onClick={() => setShowCount(5)}>
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {selectedDocument && (
        <div className="card" style={{ marginTop: "25px" }}>
          <h2>Document Preview</h2>
          <hr />
          <p><b>Document Name:</b> {selectedDocument.documentName}</p>
          <p><b>Reference Number:</b> {selectedDocument.referenceNumber}</p>
          <p><b>Department:</b> {selectedDocument.department}</p>
          <p><b>Type:</b> {getTemplateName(selectedDocument.templateId)}</p>
          <p><b>Date:</b> {formatDate(selectedDocument.createdAt)}</p>
          <p><b>Template ID:</b> {selectedDocument.templateId}</p>
          <div style={{ marginTop: "15px" }}>
            <a 
              href={`http://localhost:3000/api/documents/${selectedDocument.id}/download`}
              download
              className="btn"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && editingDoc && editTemplate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2>Edit / Regenerate Document</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              <b>{editingDoc.documentName}</b> | Ref: {editingDoc.referenceNumber}
            </p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Reference number and document name cannot be changed. Date will update automatically.
            </p>

            <h3>Fill Placeholders</h3>
            {editTemplate.placeholders?.map((placeholder) => (
              <div key={placeholder} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  {placeholder}
                </label>
                <input
                  type="text"
                  value={editPlaceholders[placeholder] || ''}
                  onChange={(e) => setEditPlaceholders({
                    ...editPlaceholders,
                    [placeholder]: e.target.value
                  })}
                  placeholder={`Enter ${placeholder}`}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button
                className="btn"
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{ flex: 1 }}
              >
                {regenerating ? 'Regenerating...' : 'Regenerate Document'}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingDoc(null);
                  setEditTemplate(null);
                  setEditPlaceholders({});
                }}
                style={{ 
                  flex: 1, 
                  background: '#6c757d',
                  color: 'white'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default History;