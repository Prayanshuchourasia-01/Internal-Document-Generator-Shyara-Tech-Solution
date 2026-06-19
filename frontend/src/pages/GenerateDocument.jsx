import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { fetchAPI } from "../api";

function GenerateDocument() {
  const [department, setDepartment] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templateCode, setTemplateCode] = useState("");

  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [previewContent, setPreviewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
        alert("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch placeholders when template changes
  useEffect(() => {
    if (!templateId) {
      setPlaceholders([]);
      setPlaceholderValues({});
      setPreviewContent("");
      return;
    }

    async function loadPlaceholders() {
      try {
        const res = await fetchAPI(`/api/templates/${templateId}/placeholders`);
        setPlaceholders(res.placeholders || []);
        const initialValues = {};
        res.placeholders?.forEach(ph => {
          initialValues[ph] = "";
        });
        setPlaceholderValues(initialValues);
        setTemplateCode(res.templateCode || "");
      } catch (err) {
        console.error("Failed to load placeholders:", err);
      }
    }
    loadPlaceholders();
  }, [templateId]);

  const getDeptTemplates = () => {
    if (!department) return [];
    return templates.filter(t => t.department === department);
  };

  const handlePlaceholderChange = (placeholder, value) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  const handlePreview = async () => {
    if (!templateId) return;
    try {
      const res = await fetchAPI('/api/documents/preview', {
        method: 'POST',
        body: JSON.stringify({
          templateId: Number(templateId),
          values: placeholderValues
        }),
      });
      setPreviewContent(res.preview || "");
    } catch (err) {
      console.error("Preview failed:", err);
    }
  };

  useEffect(() => {
    if (!templateId || Object.keys(placeholderValues).length === 0) return;
    const timer = setTimeout(() => handlePreview(), 500);
    return () => clearTimeout(timer);
  }, [placeholderValues, templateId]);

  const handleGenerate = async () => {
  const emptyFields = Object.entries(placeholderValues).filter(([_, v]) => !v.trim());
  if (emptyFields.length > 0) {
    alert(`Please fill all fields: ${emptyFields.map(([k]) => k).join(', ')}`);
    return;
  }
  if (!templateId) {
    alert("Please select a template");
    return;
  }

  setGenerating(true);
  try {
    const res = await fetchAPI('/api/documents/generate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: Number(templateId),
        values: placeholderValues
      }),
    });

    setSuccessMsg(`Document generated! Reference: ${res.referenceNumber}`);
    setTimeout(() => setSuccessMsg(""), 5000);

    // AUTO-DOWNLOAD PDF after generation
    if (res.document?.id) {
      // Trigger download
      const link = document.createElement('a');
      link.href = `http://localhost:3000/api/documents/${res.document.id}/download`;
      link.setAttribute('download', `${res.document.documentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Reset form
    setDepartment("");
    setTemplateId("");
    setTemplateCode("");
    setPlaceholders([]);
    setPlaceholderValues({});
    setPreviewContent("");
  } catch (err) {
    console.error("Generation failed:", err);
    alert("Failed to generate document: " + err.message);
  } finally {
    setGenerating(false);
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Breadcrumb />
      <h1>Generate Document</h1>

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

      <div className="generate-layout" style={{ 
        display: 'flex', 
        gap: '20px',
        height: 'calc(100vh - 180px)', // Fixed height for the whole layout
        minHeight: '500px'
      }}>

        {/* LEFT CARD - Form (scrollable if needed) */}
        <div className="card" style={{ 
          flex: 1, 
          padding: '25px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>

          <h3>1. Select Template</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Department
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setTemplateId("");
                setPlaceholders([]);
                setPlaceholderValues({});
                setPreviewContent("");
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="">Choose Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name} ({dept.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Document Type
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={!department}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                background: !department ? '#f5f5f5' : 'white'
              }}
            >
              <option value="">Choose Document Type</option>
              {getDeptTemplates().map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.templateCode})
                </option>
              ))}
            </select>
          </div>

          {placeholders.length > 0 && (
            <>
              <hr style={{ margin: "25px 0", border: '1px solid #eee' }} />
              <h3>2. Fill Placeholders</h3>

              {placeholders.map((placeholder) => (
                <div key={placeholder} style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    {placeholder}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${placeholder}`}
                    value={placeholderValues[placeholder] || ""}
                    onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT CARD - Preview (fixed height, scrollable content) */}
        <div className="card" style={{ 
          flex: 1, 
          padding: '25px', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' // Prevents card from expanding
        }}>

          <h3 style={{ flexShrink: 0 }}>Preview</h3>

          {/* Scrollable preview area */}
          <div style={{
            flex: 1,
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '15px',
            marginBottom: '15px',
            background: 'white',
            overflowY: 'auto', // Scrollable!
            whiteSpace: 'pre-wrap',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.6',
            fontSize: '14px',
            minHeight: 0 // Important for flex child scrolling
          }}>
            {!templateId ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
                Select template to preview
              </p>
            ) : !previewContent ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
                Fill placeholders to see preview
              </p>
            ) : (
              <div dangerouslySetInnerHTML={{ 
                __html: previewContent.replace(/\n/g, '<br/>') 
              }} />
            )}
          </div>

          {/* Fixed button at bottom */}
          <button
            onClick={handleGenerate}
            disabled={generating || !templateId}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              background: generating ? '#6c757d' : '#001f5c',
              color: 'white',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              flexShrink: 0 // Never shrinks!
            }}
          >
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>

        </div>
      </div>
    </>
  );
}

export default GenerateDocument;