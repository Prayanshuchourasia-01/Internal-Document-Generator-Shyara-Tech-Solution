import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Breadcrumb from "../components/Breadcrumb";

function Templates() {
  const defaultTemplates = [
    {
      name: "Offer Letter",
      department: "HR",
    },
    {
      name: "Experience Letter",
      department: "HR",
    },
    {
      name: "Appointment Letter",
      department: "HR",
    },
    {
      name: "NDA Agreement",
      department: "Legal",
    },
    {
      name: "Service Contract",
      department: "Legal",
    },
    {
      name: "Invoice",
      department: "Finance",
    },
  ];

  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem("templates");

    return savedTemplates
      ? JSON.parse(savedTemplates)
      : defaultTemplates;
  });

  useEffect(() => {
    localStorage.setItem(
      "templates",
      JSON.stringify(templates)
    );
  }, [templates]);

  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const department =
      prompt("Enter Department Name") || "General";

    const newTemplate = {
      name: file.name.replace(
        /\.(doc|docx|pdf)$/i,
        ""
      ),
      department,
    };

    setTemplates([
      ...templates,
      newTemplate,
    ]);
  };

  const deleteTemplate = (templateName) => {
    const confirmDelete = window.confirm(
      `Delete ${templateName}?`
    );

    if (!confirmDelete) return;

    const updatedTemplates = templates.filter(
      (template) =>
        template.name !== templateName
    );

    setTemplates(updatedTemplates);
  };

  return (
    <>
      <Breadcrumb />

      <div className="page-title-row">
        <div>
          <h1>Templates</h1>
        </div>

        <label className="btn">
          Add DOCX

          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleUpload}
            hidden
          />
        </label>
      </div>

      <div className="card-grid">
        {templates.map((item) => (
          <div
            className="card"
            key={item.name}
          >
            <div className="template-header">
              <h3>{item.name}</h3>

              <FaTrash
                className="delete-icon"
                onClick={() =>
                  deleteTemplate(item.name)
                }
              />
            </div>

            <p className="template-department">
              Department: {item.department}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Templates;