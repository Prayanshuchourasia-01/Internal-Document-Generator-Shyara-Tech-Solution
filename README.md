# Internal Document Automation System

A web application for generating, managing, and tracking internal documents with DOCX templates, PDF conversion, and backup/restore functionality.

---

## 📋 What It Does

- Create departments and document templates with placeholders
- Upload DOCX templates and auto-detect placeholders
- Generate documents with auto-generated reference numbers (e.g., `SHY/HR/OL/001`)
- Download generated documents as DOCX or PDF
- Search document history with filters
- Export and restore full backups

---

## 🛠 Tech Stack & Exact Versions

| Component    | Version            | Required               |
|--------------|---------------------|-------------------------|
| Node.js      | **22.19.0 LTS**     | Yes                     |
| npm          | **10.9.3**          | Yes (bundled with Node) |
| React        | **19.2.6**          | Yes                     |
| Vite         | **8.0.12**          | Yes                     |
| Express      | **5.2.1**           | Yes                     |
| Prisma       | **6.19.3**          | Yes                     |
| SQLite       | **3.x**             | Yes (bundled)           |
| LibreOffice  | **24.2.x or latest**| Yes (for PDF conversion)|
| Puppeteer    | **25.1.0**          | Yes (PDF fallback)      |

> **Tested and verified on:** Node.js 22.19.0, npm 10.9.3, Windows 10/11

---

## 📁 Project Structure

```
Backend/                  # Express API server
├── prisma/                # Database schema and SQLite file
├── src/                   # Controllers, routes, middleware, utils
├── uploads/                # Uploaded DOCX templates
├── generated-documents/    # Generated DOCX and PDF files
├── backups/                # Backup ZIP files
└── tests/                  # Test suites

frontend/                 # React Vite frontend
├── src/
│   ├── pages/              # Departments, Templates, Generate, History, Settings
│   └── Components/          # Header, Sidebar, Layout, Breadcrumb
└── public/
```

---

## ✨ Key Features Implemented

- Department management with short codes (HR, FIN, etc.)
- DOCX template upload with placeholder extraction
- Document generation preserving original DOCX formatting
- Dual PDF conversion (LibreOffice primary, Puppeteer fallback)
- Auto-generated reference numbers per department + document type
- Searchable document history with date/department filters
- Secure backup export/restore with ZIP validation
- File upload security (DOCX-only, malicious extension blocking)

---

## ✅ Prerequisites

| Software     | Exact Version              | Download Link |
|--------------|------------------------------|----------------|
| Node.js      | **22.19.0 LTS**              | [nodejs.org/dist/v22.19.0](https://nodejs.org/dist/v22.19.0/) |
| npm          | **10.9.3** (bundled with Node)| Included with Node.js installer |
| LibreOffice  | **24.2.x or latest**         | [libreoffice.org/download](https://www.libreoffice.org/download/) |

> **Important:** This project was built and tested on Node.js 22.19.0. Using a significantly different version (e.g., 18.x or 20.x) may cause compatibility issues with dependencies.

### Verify Your Versions

Open a terminal and run:

```bash
node --version
# Expected: v22.19.0

npm --version
# Expected: 10.9.3
```

If your versions differ, download and install the exact Node.js version from the link above.

---

## 🖥 LibreOffice Installation & Configuration

LibreOffice is **mandatory** for DOCX to PDF conversion. Without it, PDF generation will fail unless Puppeteer fallback is configured.

### Windows

**Step 1: Download**
1. Go to [libreoffice.org/download](https://www.libreoffice.org/download/)
2. Download LibreOffice 24.2.x (or latest stable)
3. Choose the Windows (64-bit) installer

**Step 2: Install**
1. Run the installer
2. Select "Typical" installation
3. Complete the installation wizard

**Step 3: Add to PATH**
1. Open **System Properties → Advanced → Environment Variables**
2. Under **System Variables**, find `Path` and click **Edit**
3. Click **New** and add:
   ```
   C:\Program Files\LibreOffice\program
   ```
   (Adjust path if you installed to a different location)
4. Click **OK** on all dialogs
5. Restart your terminal/command prompt

**Step 4: Verify**
```bash
soffice --version
# Expected: LibreOffice 24.2.x.x ...
```

If `soffice` is not recognized, the PATH was not set correctly. Restart your computer and try again.

### macOS

**Step 1: Install via Homebrew**
```bash
brew install --cask libreoffice
```

**Step 2: Verify PATH**

Homebrew usually adds LibreOffice automatically. Verify:
```bash
soffice --version
```

If not found, add to your shell profile (`~/.zshrc` or `~/.bash_profile`):
```bash
export PATH="/Applications/LibreOffice.app/Contents/MacOS:$PATH"
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

**Step 3: Verify**
```bash
soffice --version
# Expected: LibreOffice 24.2.x.x ...
```

### Linux (Ubuntu/Debian)

**Step 1: Install**
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

**Step 2: Verify**
```bash
soffice --version
# Expected: LibreOffice 24.2.x.x ...
```

> If using a different distribution:
> - **Fedora:** `sudo dnf install libreoffice`
> - **Arch:** `sudo pacman -S libreoffice-still`

---

## 🚀 Installation Steps

### 1. Backend Setup
```bash
cd Backend
npm install
```

### 2. Database Setup
```bash
npx prisma generate
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Start Both Services

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Application

| Service      | URL                     |
|--------------|---------------------------|
| Frontend     | http://localhost:5173     |
| Backend API  | http://localhost:3000     |

---

## 🐞 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `node: bad option or version mismatch` | Wrong Node.js version | Install Node.js 22.19.0 from official site |
| `npm ERR! during install` | npm version mismatch | Ensure npm 10.9.3 is installed |
| `LibreOffice not found` or `soffice: command not found` | LibreOffice not installed or not in PATH | Follow LibreOffice installation steps above, then restart terminal |
| `Port 3000 in use` | Another app using port 3000 | Kill The Task which is used PORT 3000 |
| `Cannot find module 'express'` | Dependencies not installed | Run `npm install` in `Backend` |
| Frontend can't connect to backend | CORS or wrong API URL | Ensure backend is running on port 3000 |

---

## 📂 File Directories (Auto-Created)

These folders are created automatically when needed:

- `Backend/uploads/` — Uploaded DOCX templates
- `Backend/generated-documents/docx/` — Generated DOCX files
- `Backend/generated-documents/pdf/` — Generated PDF files
- `Backend/backups/` — Backup ZIP files

If any are missing, create them manually:

```bash
cd Backend
mkdir -p uploads generated-documents/docx generated-documents/pdf backups
```

---

## ⚡ Useful Commands

| Command | Description |
|---------|--------------|
| `node --version` | Check Node.js version |
| `npm --version` | Check npm version |
| `soffice --version` | Check LibreOffice version |
| `npm run dev` | Start backend with auto-reload |
| `npm start` | Start backend (production) |
| `npx prisma studio` | Open database GUI |
