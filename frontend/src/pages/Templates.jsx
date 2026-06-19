import { useState, useEffect } from "react";
import { FaTrash, FaArrowLeft, FaFolder, FaFileAlt, FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { fetchAPI } from "../api";

function Templates() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCode, setTemplateCode] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch departments and templates
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [deptsRes, templatesRes] = await Promise.all([
          fetchAPI('/api/departments'),
          fetchAPI('/api/templates'),
        ]);
        setDepartments(deptsRes.departments || []);
        setTemplates(templatesRes.templates || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getDeptTemplates = (deptName) => {
    return templates.filter(t => t.department === deptName);
  };

  const getTemplateCount = (deptName) => {
    return templates.filter(t => t.department === deptName).length;
  };

  const openUploadModal = () => {
    setTemplateName("");
    setTemplateCode("");
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setTemplateName("");
    setTemplateCode("");
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename if empty
      if (!templateName) {
        const nameWithoutExt = file.name.replace(/\.(doc|docx)$/i, "");
        setTemplateName(nameWithoutExt);
      }
    }
  };

  const handleUpload = async () => {
    if (!templateName.trim() || !templateCode.trim() || !selectedFile) {
      alert("Please fill all fields: Template Name, Template Code, and DOCX File");
      return;
    }

    if (!selectedDept) {
      alert("No department selected");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('template', selectedFile);
      formData.append('name', templateName.trim());
      formData.append('templateCode', templateCode.trim().toUpperCase());
      formData.append('department', selectedDept.name);

      const res = await fetch('http://localhost:3000/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setTemplates([...templates, data.template]);
      setSuccessMsg(`Template "${data.template.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      closeUploadModal();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload template: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`Delete "${templateName}"?`)) return;

    try {
      await fetchAPI(`/api/templates/${templateId}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t.id !== templateId));
      setSuccessMsg(`Template "${templateName}" deleted!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete template");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <>
      {/* CUSTOM BREADCRUMB FOR TEMPLATES */}
      <div style={{ padding: '15px 0', color: '#666', fontSize: '14px' }}>
        <span 
          style={{ cursor: 'pointer', color: '#007bff' }}
          onClick={() => navigate('/')}
        >
          Home
        </span>
        {' > '}
        {selectedDept ? (
          <>
            <span 
              style={{ cursor: 'pointer', color: '#007bff' }}
              onClick={() => setSelectedDept(null)}
            >
              templates
            </span>
            {' > '}
            <span style={{ color: '#333', fontWeight: '500' }}>
              {selectedDept.name}
            </span>
          </>
        ) : (
          <span style={{ color: '#333', fontWeight: '500' }}>
            templates
          </span>
        )}
      </div>

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
          <h1>Templates</h1>
          {selectedDept && (
            <p style={{ color: '#666', marginTop: '5px' }}>
              Department: <b>{selectedDept.name}</b> ({getTemplateCount(selectedDept.name)} templates)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedDept && (
            <button 
              className="btn"
              onClick={() => setSelectedDept(null)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #6c757d',
                background: 'white',
                color: '#6c757d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaArrowLeft /> Back to Departments
            </button>
          )}
          
          {selectedDept && (
            <button 
              className="btn"
              onClick={openUploadModal}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#001f5c',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaUpload /> Add DOCX
            </button>
          )}
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeUploadModal}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '450px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button
              onClick={closeUploadModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ marginBottom: '5px' }}>Upload Template</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
              Department: <b>{selectedDept?.name}</b>
            </p>

            {/* Template Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Template Name *
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Offer Letter"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Template Code */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Template Code *
              </label>
              <input
                type="text"
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value.toUpperCase())}
                placeholder="e.g., OL"
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  textTransform: 'uppercase'
                }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Short code like OL, EX, SA (max 5 chars)
              </small>
            </div>

            {/* DOCX File */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                DOCX File *
              </label>
              
              <div style={{
                border: '2px dashed #ddd',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedFile ? '#f8f9fa' : 'white'
              }}>
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="docx-upload"
                />
                <label htmlFor="docx-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  {selectedFile ? (
                    <div>
                      <FaFileAlt style={{ fontSize: '32px', color: '#001f5c', marginBottom: '10px' }} />
                      <p style={{ margin: '5px 0', fontWeight: '500', color: '#333' }}>{selectedFile.name}</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <FaUpload style={{ fontSize: '32px', color: '#6c757d', marginBottom: '10px' }} />
                      <p style={{ margin: '5px 0', color: '#666' }}>Click to upload DOCX file</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>.docx files only</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ 
                  flex: 1,
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#001f5c',
                  color: 'white',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: uploading ? 0.7 : 1
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Template'}
              </button>
              <button
                onClick={closeUploadModal}
                disabled={uploading}
                style={{ 
                  flex: 1,
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6c757d',
                  color: 'white',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENTS VIEW */}
      {!selectedDept ? (
        <div className="card-grid">
          {departments.map((dept) => {
            const count = getTemplateCount(dept.name);
            return (
              <div 
                className="card" 
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px',
                  marginBottom: '10px'
                }}>
                  <FaFolder style={{ fontSize: '40px', color: '#001f5c' }} />
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{dept.name}</h3>
                    <span style={{ 
                      background: '#e9ecef', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#495057'
                    }}>
                      {dept.shortCode}
                    </span>
                  </div>
                </div>
                
                <p style={{ color: '#666', margin: '10px 0' }}>
                  {count} template{count !== 1 ? 's' : ''}
                </p>
                
                <div style={{ 
                  textAlign: 'right',
                  color: '#001f5c',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  View Templates →
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      
      /* TEMPLATES VIEW FOR SELECTED DEPARTMENT */
<div className="card-grid" style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px'
}}>
  {getDeptTemplates(selectedDept.name).length > 0 ? (
    getDeptTemplates(selectedDept.name).map((template) => (
      <div 
        className="card" 
        key={template.id} 
        style={{ 
          position: 'relative',
          padding: '20px',
          minHeight: '160px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
          gap: '10px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            minWidth: 0 // Important for text truncation
          }}>
            <FaFileAlt style={{ fontSize: '24px', color: '#001f5c', flexShrink: 0 }} />
            <h3 style={{ 
              margin: 0,
              fontSize: '16px',
              wordBreak: 'break-word', // Break long words
              overflowWrap: 'break-word',
              lineHeight: '1.3'
            }}>
              {template.name}
            </h3>
          </div>
          <button
            onClick={() => deleteTemplate(template.id, template.name)}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              flexShrink: 0
            }}
          >
            <FaTrash />
          </button>
        </div>

        <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '14px' }}>
          Code: <b>{template.templateCode}</b>
        </p>

        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Placeholders: {template.placeholders?.length || 0}
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '5px',
            maxHeight: '60px',
            overflow: 'hidden'
          }}>
            {template.placeholders?.slice(0, 3).map((ph, i) => (
              <span key={i} style={{
                background: '#e9ecef',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#495057',
                whiteSpace: 'nowrap'
              }}>
                {ph}
              </span>
            ))}
            {template.placeholders?.length > 3 && (
              <span style={{
                background: '#e9ecef',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#495057',
                whiteSpace: 'nowrap'
              }}>
                +{template.placeholders.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666'
            }}>
              <FaFolder style={{ fontSize: '48px', color: '#dee2e6', marginBottom: '15px' }} />
              <h3>No templates yet</h3>
              <p>Upload a DOCX template for {selectedDept.name} department</p>
              <button
                onClick={openUploadModal}
                style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#001f5c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <FaUpload style={{ marginRight: '8px' }} />
                Upload DOCX
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Templates;