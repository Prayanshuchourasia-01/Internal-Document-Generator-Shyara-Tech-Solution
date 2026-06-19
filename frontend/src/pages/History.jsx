import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";

function History() {
  const departments =
    JSON.parse(localStorage.getItem("departments")) || [];

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCount, setShowCount] = useState(5);
  const [openMenu, setOpenMenu] = useState(null);

  // NEW: editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const savedHistory =
      JSON.parse(localStorage.getItem("history")) || [];
    setDocuments(savedHistory);
  }, []);

  const documentTypes = [...new Set(documents.map((doc) => doc.type))];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.document?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "" || doc.department === selectedDepartment;

    const matchesType = selectedType === "" || doc.type === selectedType;

    return matchesSearch && matchesDepartment && matchesType;
  });

  const deleteDocument = (indexToDelete) => {
    const updatedDocuments = documents.filter((_, index) => index !== indexToDelete);
    setDocuments(updatedDocuments);
    localStorage.setItem("history", JSON.stringify(updatedDocuments));
    setOpenMenu(null);
  };

  const saveEdit = (index) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = {
      ...editData,
      reference: documents[index].reference, // keep reference unchanged
    };
    setDocuments(updatedDocuments);
    localStorage.setItem("history", JSON.stringify(updatedDocuments));
    setEditingIndex(null);
    setOpenMenu(null);
  };

  return (
    <>
      <Breadcrumb />
      <h1>Document History</h1>

      {/* Filters */}
      <div className="history-filters">
        <input
          className="search-box"
          placeholder="Search by document, reference or department"
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
            <option key={dept} value={dept}>
              {dept}
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
            <th>Document</th>
            <th>Reference</th>
            <th>Department</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.slice(0, showCount).map((doc, index) => (
              <tr key={index}>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.document}
                      onChange={(e) =>
                        setEditData({ ...editData, document: e.target.value })
                      }
                    />
                  ) : (
                    <span
                      className="document-link"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {doc.document}
                    </span>
                  )}
                </td>
                <td>{doc.reference}</td>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.department}
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
                      value={editData.type}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                    />
                  ) : (
                    doc.type
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.date}
                      onChange={(e) =>
                        setEditData({ ...editData, date: e.target.value })
                      }
                    />
                  ) : (
                    doc.date
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
          <p>
            <b>Document:</b> {selectedDocument.document}
          </p>
          <p>
            <b>Reference:</b> {selectedDocument.reference}
          </p>
          <p>
            <b>Department:</b> {selectedDocument.department}
          </p>
          <p>
            <b>Type:</b> {selectedDocument.type}
          </p>
          <p>
            <b>Date:</b> {selectedDocument.date}
          </p>
        </div>
      )}
    </>
  );
}

export default History;
