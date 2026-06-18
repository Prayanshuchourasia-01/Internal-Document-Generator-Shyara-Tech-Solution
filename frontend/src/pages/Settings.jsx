import { useState } from "react";
import Breadcrumb from "../components/Breadcrumb";

function Settings() {
  // Step 1: Create state for storage path
  const [storagePath, setStoragePath] = useState("C:\\Shyara\\Documents");

  return (
    <>
      <Breadcrumb />

      <h1>Settings</h1>

      <div className="settings-cards">

        <div className="card">
          <h3>Backup & Restore</h3>
          <div className="button-group">
            <button>Create Backup</button>
            <button>Restore Backup</button>
          </div>
        </div>

        <div className="card">
          <h3>Storage Location</h3>
          {/* Step 2: Bind value to state */}
          <input
            type="text"
            value={storagePath}
            onChange={(e) => setStoragePath(e.target.value)} // Step 3: Update state
          />
        </div>

      </div>
    </>
  );
}

export default Settings;
