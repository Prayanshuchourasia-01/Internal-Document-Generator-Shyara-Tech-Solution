import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { fetchAPI } from "../api";

function History() {
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCount, setShowCount] = useState(5);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW: editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch documents and departments from backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [docsRes, deptsRes] = await Promise.all([
          fetchAPI('/api/documents'),
          fetchAPI('/api/departments'),
        ]);
        setDocuments(docsRes.documents || []);
        setDepartments(deptsRes.departments || []);
      } catch (err) {
        console.error("API ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Extract unique document types from templates (using department as type for now, or we can fetch templates)
  const documentTypes = [...new Set(documents.map((doc) => doc.department))];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "" || doc.department === selectedDepartment;

    const matchesType = selectedType === "" || doc.department === selectedType;

    return matchesSearch && matchesDepartment && matchesType;
  });

const deleteDocument = async (indexToDelete) => {
  const doc = filteredDocuments[indexToDelete];
  try {
    await fetchAPI(`/api/documents/${doc.id}`, { method: 'DELETE' });
    setDocuments(documents.filter(d => d.id !== doc.id));
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete document");
  }
  setOpenMenu(null);
};

const saveEdit = async (index) => {
  const doc = filteredDocuments[index];
  try {
    const updated = await fetchAPI(`/api/documents/${doc.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        documentName: editData.documentName,
        department: editData.department,
      }),
    });
    
    // Update local state with response
    setDocuments(documents.map(d => d.id === doc.id ? updated.document : d));
    setEditingIndex(null);
    setOpenMenu(null);
  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update document");
  }
};
  // Format date nicely
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.slice(0, showCount).map((doc, index) => (
              <tr key={doc.id}>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.documentName || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, documentName: e.target.value })
                      }
                    />
                  ) : (
                    <span
                      className="document-link"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {doc.documentName}
                    </span>
                  )}
                </td>
                <td>{doc.referenceNumber}</td>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.department || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, department: e.target.value })
                      }
                    />
                  ) : (
                    doc.department
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.department || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, department: e.target.value })
                      }
                    />
                  ) : (
                    doc.department
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.createdAt || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, createdAt: e.target.value })
                      }
                    />
                  ) : (
                    formatDate(doc.createdAt)
                  )}
                </td>
                <td style={{ position: "relative" }}>
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === index ? null : index)
                    }
                  >
                    ⋮
                  </button>

                  {openMenu === index && (
                    <div className="dropdown-menu">
                      {editingIndex === index ? (
                        <>
                          <button onClick={() => saveEdit(index)}>Save</button>
                          <button onClick={() => setEditingIndex(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingIndex(index);
                              setEditData(doc);
                            }}
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteDocument(index)}>
                            Delete
                          </button>
                         <button onClick={() => {
  window.open(`http://localhost:3000/api/documents/${doc.id}/download`, '_blank');
  setOpenMenu(null);
}}>
  Download PDF
</button>
                        </>
                      )}
                    </div>
                  )}
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
          <p><b>Date:</b> {formatDate(selectedDocument.createdAt)}</p>
          <p><b>Template ID:</b> {selectedDocument.templateId}</p>
          <div style={{ marginTop: "15px" }}>
            <a 
              href={`http://localhost:3000${selectedDocument.pdfPath || selectedDocument.filePath}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default History;