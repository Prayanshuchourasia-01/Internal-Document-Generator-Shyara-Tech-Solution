import { useState, useEffect } from "react";

function AddDepartmentModal({ onClose, onSave, editingDept }) {
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");

  useEffect(() => {
    if (editingDept) {
      setName(editingDept.name || "");
      setShortCode(editingDept.shortCode || "");
    } else {
      setName("");
      setShortCode("");
    }
  }, [editingDept]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedShortCode = shortCode.trim().toUpperCase();

    if (!trimmedName || !trimmedShortCode) {
      alert("Both department name and short code are required");
      return;
    }

    onSave(trimmedName, trimmedShortCode);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '400px'
      }} onClick={(e) => e.stopPropagation()}>
        <h2>{editingDept ? 'Edit Department' : 'Add Department'}</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Department Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Human Resources"
            autoFocus
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Short Code *
          </label>
          <input
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value.toUpperCase())}
            placeholder="e.g., HR"
            maxLength={5}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '14px',
              textTransform: 'uppercase'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Max 5 characters, will be stored in uppercase
          </small>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            style={{ 
              flex: 1,
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#001f5c',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {editingDept ? 'Update' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#6c757d',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDepartmentModal;