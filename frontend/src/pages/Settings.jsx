import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { fetchAPI } from "../api";

function Settings() {
  const [storagePath, setStoragePath] = useState("C:\\Shyara\\Documents");
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [dbStatus, setDbStatus] = useState("checking");

  // Check backend and database status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check backend
      const res = await fetchAPI('/test-db');
      setBackendStatus("connected");
      setDbStatus("connected");
    } catch (err) {
      setBackendStatus("disconnected");
      setDbStatus("disconnected");
      console.error("Status check failed:", err);
    }
  };

  // Create Backup
  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      const link = document.createElement('a');
      link.href = 'http://localhost:3000/api/backup/export';
      link.setAttribute('download', `backup-${new Date().toISOString().slice(0,10)}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMsg("Backup created and downloading...");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Backup failed:", err);
      setErrorMsg("Failed to create backup");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setBackupLoading(false);
    }
  };

  // Restore Backup with confirmation
  const handleRestoreBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate it's a ZIP file
    if (!file.name.endsWith('.zip')) {
      setErrorMsg("Please upload a ZIP file only");
      setTimeout(() => setErrorMsg(""), 3000);
      event.target.value = '';
      return;
    }

    // Warning confirmation
    const confirmRestore = window.confirm(
      "⚠️ WARNING: Restoring a backup will REPLACE all current data!\n\n" +
      "This will overwrite:\n" +
      "• All documents\n" +
      "• All templates\n" +
      "• All departments\n" +
      "• Database records\n\n" +
      "Are you sure you want to continue?"
    );

    if (!confirmRestore) {
      event.target.value = '';
      return;
    }

    setRestoreLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch('http://localhost:3000/api/backup/restore', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setSuccessMsg(data.message || "Backup restored successfully! Please refresh the page.");
      setTimeout(() => setSuccessMsg(""), 8000); // Show longer for restore
      
      // Re-check status after restore
      setTimeout(() => checkStatus(), 2000);
      
    } catch (err) {
      console.error("Restore failed:", err);
      setErrorMsg("Failed to restore backup: " + err.message);
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setRestoreLoading(false);
      event.target.value = '';
    }
  };

  // Save Storage Path
  const handleSavePath = () => {
    localStorage.setItem('storagePath', storagePath);
    setSuccessMsg("Storage path saved!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <>
      <Breadcrumb />
      <h1>Settings</h1>

      {successMsg && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '12px 15px', 
          borderRadius: '6px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ✅ {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px 15px', 
          borderRadius: '6px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ❌ {errorMsg}
        </div>
      )}

      <div className="settings-cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Backup & Restore Card */}
        <div className="card" style={{ padding: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Backup & Restore</h3>
          
          <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#001f5c',
                color: 'white',
                cursor: backupLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: backupLoading ? 0.7 : 1
              }}
            >
              {backupLoading ? 'Creating...' : '⬇️ Create Backup'}
            </button>

            <label style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #001f5c',
              background: 'white',
              color: '#001f5c',
              cursor: restoreLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              opacity: restoreLoading ? 0.7 : 1
            }}>
              {restoreLoading ? 'Restoring...' : '⬆️ Restore Backup'}
              <input
                type="file"
                accept=".zip"
                onChange={handleRestoreBackup}
                hidden
                disabled={restoreLoading}
              />
            </label>
          </div>

          <p style={{ 
            marginTop: '15px', 
            color: '#666', 
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            <b>Create Backup:</b> Downloads a ZIP file containing all your database, templates, and generated documents.<br/>
            <b>Restore Backup:</b> Upload a previously created backup ZIP to restore all data. <span style={{ color: '#dc3545' }}>⚠️ This will replace all current data!</span>
          </p>
        </div>

        {/* Storage Location Card */}
        <div className="card" style={{ padding: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Storage Location</h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Default Save Path
              </label>
              <input
                type="text"
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{ 
                marginTop: '8px', 
                color: '#666', 
                fontSize: '12px' 
              }}>
                Where generated documents will be saved locally
              </p>
            </div>
            
            <button
              onClick={handleSavePath}
              style={{
                padding: '12px 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#28a745',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '24px'
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* About Card with Backend + Database Status */}
        <div className="card" style={{ padding: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>About</h3>
          <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
  <p style={{ margin: '0 0 5px 0' }}>
    <b style={{ fontSize: '16px', color: '#001f5c' }}>Shyara DocuFlow</b>
    <span style={{ color: '#999', marginLeft: '10px' }}>Version 1.0</span>
  </p>
  <p style={{ margin: '0 0 15px 0' }}>
    Enterprise Document Automation & Management Platform
  </p>
  
  <div style={{ 
    marginTop: '15px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#666', minWidth: '80px' }}>Backend:</span>
      {backendStatus === "connected" ? (
        <span style={{ color: '#28a745', fontWeight: '500' }}>● Online</span>
      ) : (
        <span style={{ color: '#dc3545', fontWeight: '500' }}>● Offline</span>
      )}
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#666', minWidth: '80px' }}>Database:</span>
      {dbStatus === "connected" ? (
        <span style={{ color: '#28a745', fontWeight: '500' }}>● Connected (SQLite)</span>
      ) : (
        <span style={{ color: '#dc3545', fontWeight: '500' }}>● Disconnected</span>
      )}
    </div>
  </div>
</div>
        </div>

      </div>
    </>
  );
}

export default Settings;