import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import AddDepartmentModal from "../components/AddDepartmentModal";
import { fetchAPI } from "../api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch departments from backend
  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoading(true);
        const res = await fetchAPI('/api/departments');
        setDepartments(res.departments || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
  }, []);

  const addDepartment = () => {
    setEditingDept(null);
    setShowModal(true);
  };

  const editDepartment = (dept) => {
    setEditingDept(dept);
    setShowModal(true);
  };
const handleSave = async (name, shortCode) => {
  console.log("Saving department:", { name, shortCode, editingDept }); // Debug

  try {
    if (editingDept) {
      // Update existing
      const res = await fetchAPI(`/api/departments/${editingDept.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, shortCode }),
      });
      setDepartments(departments.map(d => d.id === editingDept.id ? res.department : d));
      setSuccessMsg(`Department "${name}" updated successfully!`);
    } else {
      // Create new
      const res = await fetchAPI('/api/departments', {
        method: 'POST',
        body: JSON.stringify({ name, shortCode }),
      });
      setDepartments([...departments, res.department]);
      setSuccessMsg(`Department "${name}" added successfully!`);
    }
    setTimeout(() => setSuccessMsg(""), 3000);
    setShowModal(false);
    setEditingDept(null);
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save department: " + err.message);
  }
};

  const deleteDepartment = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

    try {
      await fetchAPI(`/api/departments/${dept.id}`, { method: 'DELETE' });
      setDepartments(departments.filter(d => d.id !== dept.id));
      setSuccessMsg(`Department "${dept.name}" deleted successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete department: " + err.message);
    }
  };

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <>
      <Breadcrumb />
      
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

      <div className="page-title-row">
        <div>
          <h1>Departments</h1>
          <p>Manage department document types</p>
        </div>
        <button 
          className="btn" 
          onClick={addDepartment}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#001f5c',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Add Department
        </button>
      </div>

      {showModal && (
        <AddDepartmentModal
          onClose={() => {
            setShowModal(false);
            setEditingDept(null);
          }}
          onSave={handleSave}
          editingDept={editingDept}
        />
      )}

      <div className="card-grid">
        {departments.map((dept) => (
          <div className="card" key={dept.id} style={{ padding: '20px' }}>
            <div className="department-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '10px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{dept.name}</h3>
                <span style={{ 
                  background: '#e9ecef', 
                  padding: '3px 10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#495057',
                  fontWeight: '500'
                }}>
                  {dept.shortCode}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => editDepartment(dept)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #007bff',
                    background: '#007bff',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteDepartment(dept)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dc3545',
                    background: '#dc3545',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            <p style={{ margin: '0', color: '#666' }}>Document Types</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Departments;