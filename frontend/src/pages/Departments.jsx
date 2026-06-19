import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import AddDepartmentModal from "../components/AddDepartmentModal";

function Departments() {
  const defaultDepartments = ["HR", "Legal", "Finance", "Operations"];

  const [departments, setDepartments] = useState(() => {
    const savedDepartments = localStorage.getItem("departments");

    if (!savedDepartments) return defaultDepartments;

    try {
      const parsedDepartments = JSON.parse(savedDepartments);

      return Array.isArray(parsedDepartments)
        ? parsedDepartments.filter((dept) => typeof dept === "string" && dept.trim())
        : defaultDepartments;
    } catch {
      return defaultDepartments;
    }
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("departments", JSON.stringify(departments));
  }, [departments]);

  const addDepartment = () => {
    setShowModal(true);
  };

  const handleSave = (departmentName) => {
    const trimmedName = departmentName.trim();

    if (!trimmedName) return;

    const alreadyExists = departments.some(
      (dept) => dept.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) return;

    setDepartments([...departments, trimmedName]);
    setShowModal(false);
  };

  const deleteDepartment = (departmentName) => {
    const updatedDepartments = departments.filter((dept) => dept !== departmentName);
    setDepartments(updatedDepartments);
  };

  return (
    <>
      <Breadcrumb />
      <div className="page-title-row">
        <div>
          <h1>Departments</h1>
          <p>Manage department document types</p>
        </div>
        <button className="btn" onClick={addDepartment}>
          Add Department
        </button>
      </div>

      {showModal && (
        <AddDepartmentModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <div className="card-grid">
        {departments.map((item) => (
          <div className="card" key={item}>
            <div className="department-header">
              <h3>{item}</h3>
              <button
                className="delete-btn"
                onClick={() => deleteDepartment(item)}
              >
                Delete
              </button>
            </div>
            <p>Document Types</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Departments;
