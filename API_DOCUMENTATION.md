# API Documentation
 
**Base URL:** `http://localhost:5000`
**Frontend URL:** `http://localhost:5173`
**Tested on:** Node.js 22.19.0, Express 5.2.1, Prisma 6.19.3, SQLite 3.x
 
---
 
## Table of Contents
 
- [Error Format](#error-format)
- [Status Codes](#status-codes)
- [Departments](#departments)
- [Templates](#templates)
- [Documents](#documents)
- [Backup](#backup)
- [User Routes](#user-routes)
- [Placeholder Syntax](#placeholder-syntax)
- [File Storage Paths](#file-storage-paths)
---
 
## Error Format
 
All errors follow this format:
 
```json
{
  "success": false,
  "message": "Error description"
}
```
 
---
 
## Status Codes
 
| Code | Meaning               |
|------|------------------------|
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request             |
| 403  | Forbidden               |
| 404  | Not Found               |
| 415  | Unsupported Media Type  |
| 500  | Server Error            |
 
---
 
## Departments
 
**Base path:** `/api/departments`
 
### Create Department
 
`POST /api/departments`
 
**Request Body**
```json
{
  "name": "Human Resources",
  "shortCode": "HR"
}
```
 
**Response `201`**
```json
{
  "success": true,
  "department": {
    "id": 1,
    "name": "Human Resources",
    "shortCode": "HR",
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Department name and shortCode are required"
}
```
 
**Error `400` — Duplicate**
```json
{
  "success": false,
  "message": "Department with that name or shortCode already exists"
}
```
 
---
 
### List All Departments
 
`GET /api/departments`
 
**Response `200`**
```json
{
  "success": true,
  "departments": [
    {
      "id": 1,
      "name": "Human Resources",
      "shortCode": "HR",
      "createdAt": "2026-06-17T10:30:45.123Z"
    }
  ]
}
```
 
---
 
### Get Department by ID
 
`GET /api/departments/:id`
 
**Response `200`**
```json
{
  "success": true,
  "department": {
    "id": 1,
    "name": "Human Resources",
    "shortCode": "HR",
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `404`**
```json
{
  "success": false,
  "message": "Department not found"
}
```
 
---
 
### Update Department
 
`PUT /api/departments/:id`
 
**Request Body** *(at least one field is required)*
```json
{
  "name": "Human Resources",
  "shortCode": "HR"
}
```
 
**Response `200`**
```json
{
  "success": true,
  "department": {
    "id": 1,
    "name": "Human Resources",
    "shortCode": "HR",
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Please provide name or shortCode to update"
}
```
 
**Error `400` — Duplicate**
```json
{
  "success": false,
  "message": "Another department with that name or shortCode already exists"
}
```
 
---
 
### Delete Department
 
`DELETE /api/departments/:id`
 
**Response `200`**
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```
 
**Error `404`**
```json
{
  "success": false,
  "message": "Department not found"
}
```
 
---
 
## Templates
 
**Base path:** `/api/templates`
 
### Create Text Template
 
`POST /api/templates`
 
**Request Body**
```json
{
  "name": "Offer Letter",
  "templateCode": "OL",
  "department": "HR",
  "content": "Dear <name>,\n\nWe offer you <position> at <salary>.\nStart Date: <startDate>"
}
```
> `department` or `departmentId` is required. `templateCode` is required.
 
**Response `201`**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "Offer Letter",
    "templateCode": "OL",
    "department": "HR",
    "content": "Dear <name>...",
    "placeholders": ["name", "position", "salary", "startDate"],
    "filePath": null,
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Template name, template code, content and department are required."
}
```
 
**Error `404`**
```json
{
  "success": false,
  "message": "Department not found. Provide a valid department id or name."
}
```
 
---
 
### Upload DOCX Template
 
`POST /api/templates/upload`
 
**Content-Type:** `multipart/form-data`
 
**Fields**
 
| Field | Type | Description |
|-------|------|--------------|
| `template` | file | DOCX file, max 5MB |
| `name` | text | Template name |
| `templateCode` | text | Template code (e.g., `"OL"`) |
| `department` | text | Department name, *or* |
| `departmentId` | text | Department ID |
 
**Response `201`**
```json
{
  "success": true,
  "message": "Template uploaded successfully",
  "template": {
    "id": 2,
    "name": "Offer Letter Template",
    "templateCode": "OL",
    "department": "HR",
    "content": "Dear <name>...",
    "placeholders": ["name", "position", "salary", "startDate"],
    "filePath": "/path/to/uploads/...",
    "createdAt": "2026-06-17T10:30:45.123Z"
  },
  "placeholders": ["name", "position", "salary", "startDate"]
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Template name, template code and department are required."
}
```
 
**Error `400` — No file**
```json
{
  "success": false,
  "message": "DOCX file is required."
}
```
 
---
 
### List All Templates
 
`GET /api/templates`
 
**Response `200`**
```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "name": "Offer Letter",
      "templateCode": "OL",
      "department": "HR",
      "content": "Dear <name>...",
      "placeholders": ["name", "position", "salary", "startDate"],
      "filePath": null,
      "createdAt": "2026-06-17T10:30:45.123Z"
    }
  ]
}
```
 
---
 
### Get Template by ID
 
`GET /api/templates/:id`
 
**Response `200`**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "Offer Letter",
    "templateCode": "OL",
    "department": "HR",
    "content": "Dear <name>...",
    "placeholders": ["name", "position", "salary", "startDate"],
    "filePath": null,
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `404`**
```json
{
  "success": false,
  "message": "Template not found"
}
```
 
---
 
### Get Template Placeholders
 
`GET /api/templates/:id/placeholders`
 
**Response `200`**
```json
{
  "success": true,
  "templateId": 1,
  "templateCode": "OL",
  "templateName": "Offer Letter",
  "placeholders": ["name", "position", "salary", "startDate"]
}
```
 
---
 
### Update Template
 
`PUT /api/templates/:id`
 
**Request Body** *(at least one field is required)*
```json
{
  "name": "Updated Offer Letter",
  "templateCode": "OL",
  "department": "HR",
  "content": "Updated content with <placeholder1>"
}
```
 
**Response `200`**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "Updated Offer Letter",
    "templateCode": "OL",
    "department": "HR",
    "content": "Updated content...",
    "placeholders": ["placeholder1"],
    "filePath": null,
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Provide at least one field to update: name, templateCode, department or content."
}
```
 
---
 
### Delete Template
 
`DELETE /api/templates/:id`
 
**Response `200`**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```
 
---
 
## Documents
 
**Base path:** `/api/documents`
 
### Preview Document (No Save)
 
`POST /api/documents/preview`
 
**Request Body**
```json
{
  "templateId": 1,
  "values": {
    "name": "Jane Smith",
    "position": "Product Manager",
    "salary": "$130,000",
    "startDate": "2026-08-01"
  }
}
```
 
**Response `200`**
```json
{
  "success": true,
  "templateId": 1,
  "preview": "Dear Jane Smith,\n\nWe are pleased to offer you the position of Product Manager..."
}
```
 
---
 
### Generate Document
 
`POST /api/documents/generate`
 
**Request Body**
```json
{
  "templateId": 1,
  "values": {
    "name": "John Doe",
    "position": "Software Engineer",
    "salary": "$120,000",
    "startDate": "2026-07-01"
  }
}
```
 
**Response `201`**
```json
{
  "success": true,
  "message": "Document generated successfully",
  "referenceNumber": "SHY/HR/OL/001",
  "document": {
    "id": 1,
    "templateId": 1,
    "documentName": "SHY_HR_OL_001",
    "referenceNumber": "SHY/HR/OL/001",
    "department": "HR",
    "content": "Dear John Doe...",
    "filePath": "/path/to/generated-documents/pdf/...",
    "docxPath": "/path/to/generated-documents/docx/...",
    "pdfPath": "/path/to/generated-documents/pdf/...",
    "metadata": "{\"name\":\"John Doe\",\"position\":\"Software Engineer\"}",
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
> **Reference Number Format:** `SHY/{DEPT_SHORTCODE}/{TEMPLATE_CODE}/{SEQUENCE}`
 
---
 
### Regenerate Document
 
`POST /api/documents/:id/regenerate`
 
**Request Body**
```json
{
  "values": {
    "name": "Updated Name",
    "position": "Updated Position",
    "salary": "$150,000",
    "startDate": "2026-09-01"
  }
}
```
 
**Response `200`**
```json
{
  "success": true,
  "message": "Document regenerated successfully",
  "referenceNumber": "SHY/HR/OL/001",
  "document": {
    "id": 1,
    "templateId": 1,
    "documentName": "SHY_HR_OL_001",
    "referenceNumber": "SHY/HR/OL/001",
    "department": "HR",
    "content": "Dear Updated Name...",
    "filePath": "/path/to/generated-documents/pdf/...",
    "docxPath": "/path/to/generated-documents/docx/...",
    "pdfPath": "/path/to/generated-documents/pdf/...",
    "metadata": "{\"name\":\"Updated Name\",\"position\":\"Updated Position\"}",
    "createdAt": "2026-06-21T12:00:00.000Z"
  }
}
```
 
---
 
### List All Documents / Search
 
`GET /api/documents`
 
**Query Parameters** *(all optional)*
 
| Parameter | Description |
|-----------|--------------|
| `search` | Search term (matches `documentName`, `referenceNumber`, `department`, `metadata`) |
| `department` | Filter by department |
| `startDate` | Filter from date (ISO 8601) |
| `endDate` | Filter to date (ISO 8601) |
 
**Example**
```
GET /api/documents?search=John&department=HR&startDate=2026-06-01&endDate=2026-06-30
```
 
**Response `200`**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "templateId": 1,
      "documentName": "SHY_HR_OL_001",
      "referenceNumber": "SHY/HR/OL/001",
      "department": "HR",
      "content": "Dear John Doe...",
      "filePath": "/path/to/generated-documents/...",
      "docxPath": "/path/to/generated-documents/docx/...",
      "pdfPath": "/path/to/generated-documents/pdf/...",
      "metadata": "{\"name\":\"John Doe\"}",
      "createdAt": "2026-06-17T10:30:45.123Z"
    }
  ]
}
```
 
---
 
### Get Document by ID
 
`GET /api/documents/:id`
 
**Response `200`**
```json
{
  "success": true,
  "document": {
    "id": 1,
    "templateId": 1,
    "documentName": "SHY_HR_OL_001",
    "referenceNumber": "SHY/HR/OL/001",
    "department": "HR",
    "content": "Dear John Doe...",
    "filePath": "/path/to/generated-documents/...",
    "docxPath": "/path/to/generated-documents/docx/...",
    "pdfPath": "/path/to/generated-documents/pdf/...",
    "metadata": "{\"name\":\"John Doe\"}",
    "createdAt": "2026-06-17T10:30:45.123Z"
  }
}
```
 
---
 
### Update Document
 
`PUT /api/documents/:id`
 
**Request Body** *(at least one field is required)*
```json
{
  "documentName": "Updated Name",
  "department": "FIN",
  "metadata": { "key": "value" }
}
```
 
**Response `200`**
```json
{
  "success": true,
  "document": {
    "id": 1,
    "documentName": "Updated Name",
    "department": "FIN",
    "metadata": "{\"key\":\"value\"}"
  }
}
```
 
---
 
### Delete Document
 
`DELETE /api/documents/:id`
 
**Response `200`**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```
 
---
 
### Generate PDF
 
`GET /api/documents/:id/pdf`
 
**Response `200`**
```json
{
  "success": true,
  "message": "PDF generated successfully",
  "filePath": "/path/to/generated-documents/pdf/...",
  "pdfPath": "/path/to/generated-documents/pdf/...",
  "docxPath": "/path/to/generated-documents/docx/..."
}
```
 
**Error `404`**
```json
{
  "success": false,
  "message": "Document not found"
}
```
 
---
 
### Download Document
 
`GET /api/documents/:id/download`
 
**Response:** Binary file (DOCX or PDF)
 
**Error `403`**
```json
{
  "success": false,
  "message": "Access to this file is forbidden"
}
```
 
---
 
## Backup
 
**Base path:** `/api/backup`
 
### Export Backup
 
`GET /api/backup/export`
 
**Response:** Binary ZIP file containing:
- `database/dev.db`
- `uploads/`
- `generated-documents/`
---
 
### Restore Backup
 
`POST /api/backup/restore`
 
**Content-Type:** `multipart/form-data`
 
**Fields**
 
| Field | Type | Description |
|-------|------|--------------|
| `backup` | file | ZIP backup file, max 100MB |
 
**Response `200`**
```json
{
  "success": true,
  "message": "Backup restored successfully"
}
```
 
**Error `400`**
```json
{
  "success": false,
  "message": "Backup ZIP file is required."
}
```
 
**Error `400` — Invalid ZIP**
```json
{
  "success": false,
  "message": "Invalid backup archive (contains unsafe paths)"
}
```
 
---
 
### Download Backup by Filename
 
`GET /api/backup/download/:filename`
 
**Response:** Binary ZIP file
 
---
 
## User Routes
 
**Base path:** `/user`
 
> **Note:** These routes are defined in `userRoute.js` but not detailed in the provided controllers. Refer to your `userRoutes.js` and `userController.js` for specific endpoints.
 
---
 
## Placeholder Syntax
 
Use angle brackets in templates:
 
```
Dear <name>, your salary is <salary> starting <startDate>.
```
 
Placeholders are auto-detected from both text templates and uploaded DOCX files. They are stored as JSON arrays in the database.
 
---
 
## File Storage Paths
 
| Type | Path |
|------|------|
| DOCX files | `Backend/generated-documents/docx/` |
| PDF files | `Backend/generated-documents/pdf/` |
| Uploaded templates | `Backend/uploads/` |
| Database | `Backend/prisma/dev.db` |
| Backups | `Backend/backups/` |
 