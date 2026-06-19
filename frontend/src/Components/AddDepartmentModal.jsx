// AddDepartmentModal.jsx
import React, { useState } from "react";

function AddDepartmentModal({ onClose, onSave }) {
  const [departmentName, setDepartmentName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = departmentName.trim();

    if (!trimmedName) return;

    onSave(trimmedName);
    setDepartmentName("");
  };

  return (
    <div className="modal-overlay">
      <form className="modal" onSubmit={handleSubmit}>
        <h2>Enter Department Name</h2>
        <input
          type="text"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          autoFocus
        />

        <div className="modal-actions">
          <button className="btn save-btn" type="submit">
            Save
          </button>
          <button className="btn cancel-btn" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDepartmentModal;
