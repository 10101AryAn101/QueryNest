# QueryNest Startup & Testing Guide

## ✅ Configuration Complete

**MongoDB Atlas URI**: Connected to `cluster0.v9pc5nf.mongodb.net`

Database: `querynest`

## 🚀 Quick Start

### Terminal 1: Backend (Node.js + Express)

```powershell
cd D:\Assignment1\backend
npm run dev
```

**Expected output** (wait ~10 seconds for DB connection):
```
MongoDB connected
Server listening on port 5000
```

### Terminal 2: Frontend (Vite + React)

```powershell
cd D:\Assignment1\frontend
npm install  # if not already done
npm run dev
```

**Expected output**:
```
VITE v5.x.x ready in ... ms

➜  Local:   http://localhost:5173/
```

## 🧪 Testing Workflow

### 1. **Test Authentication**
- Open http://localhost:5173
- You should be redirected to `/auth/login`
- Click "Sign up" and create a new account (any email/password)
- After signup, login with those credentials
- Verify you land on `/dashboard`

### 2. **Test Document Upload**
- On dashboard, click the "Upload" button
- Create or find a test file: `.pdf`, `.docx`, `.txt`, or `.pptx`
- Fill in:
  - **Title** (optional, auto-fills from filename)
  - **Category** (select from dropdown: Brand, Strategy, etc.)
  - **Tags** (comma-separated, e.g., "2025, important, review")
- Click **Upload**
- Verify success message

### 3. **Test Search**
- Use the search bar in the navbar
- Type a keyword from your document (e.g., from extracted text or tags)
- Click "Search"
- Should show search results (title, category, version number, upload date)
- Click a result to view document details

### 4. **Test Document Details**
- From search results, click a document title
- Should show:
  - **Extracted Text Preview** (first 2000 chars)
  - **Download Latest** button
  - **View Version History** link
- Click "View Version History"

### 5. **Test Version History**
- Shows all versions of a document
- Each version shows: version number, uploader, date, file type, size
- Each version has a **Download** button
- Try downloading an older version

### 6. **Test Duplicate Detection**
- Upload the same file again (exact same content)
- Should get message: "Duplicate document. Already exists."

### 7. **Test Versioning**
- Modify the same file (add a note, edit text)
- Upload again with same **Title** but different file content
- Should create a new version (not duplicate)
- Check version history to see v1, v2, etc.

## 📊 API Endpoints (for reference)

### Authentication
- `POST /api/auth/signup` — Register user
- `POST /api/auth/login` — Login, returns JWT token

### Documents
- `POST /api/documents/upload` — Upload file (multipart/form-data, requires auth)
- `GET /api/documents/search?q=keyword&category=Brand&tags=2025` — Search documents
- `GET /api/documents/:documentId` — Get document metadata
- `GET /api/documents/:documentId/versions` — List all versions
- `GET /api/documents/download/:versionId` — Download file

### Health
- `GET /api/health` — Server status check

## 🔍 Backend Features Implemented

✅ JWT authentication (7-day expiry)
✅ Password hashing with bcrypt
✅ Document upload with:
  - Multer file handling (memory storage)
  - GridFS storage in MongoDB
  - SHA-256 duplicate detection
  - Automatic text extraction (PDF, DOCX, TXT)
  - PPTX support (optional, graceful fallback)
✅ Versioning system:
  - Multiple versions per document
  - Latest version tracking
  - Per-version metadata (uploader, date, file type, size)
✅ Full-text search:
  - MongoDB text index on extracted text
  - Filters by category, tags, file type, upload date range
  - Returns only latest version per document
✅ File download streaming from GridFS
✅ CORS configured for localhost

## 🎨 Frontend Features Implemented

✅ Vite + React with Tailwind CSS
✅ React Router for navigation
✅ Protected routes (redirect to login if not authenticated)
✅ Authentication context + localStorage persistence
✅ Pages:
  - Login / Signup
  - Dashboard (entry point)
  - Upload Document (with category + tags selector)
  - Search Results (keyword search)
  - Document Details (metadata + extracted text preview + download)
  - Version History (list versions with download buttons)
✅ Navigation bar with:
  - Search input (redirects to `/search?q=...`)
  - Logout button

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `.env` MongoDB URI. Verify internet connection for Atlas. |
| "Cannot find module" errors | Run `npm install` in both `frontend/` and `backend/` |
| Port 5000 already in use | Change `PORT` in `.env` or kill the process using that port |
| Upload fails | Check file size (>100MB may have issues). Ensure file is supported (PDF, DOCX, TXT, PPTX). |
| Search returns no results | Text index may need time to build. Try searching again, or ensure extracted text contains your keyword. |
| Login redirects back to login | Clear localStorage: `localStorage.clear()` in DevTools console. |

## 📝 Environment Variables

Backend (`.env`):
```
MONGO_URI=mongodb+srv://aryanshukla05study_db_user:rpjebVIpCyhYf2Cb@cluster0.v9pc5nf.mongodb.net/querynest?appName=Cluster0
JWT_SECRET=querynest-secret-key-2025-prod-change-me
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Frontend (`.env`):
```
VITE_API_URL=http://localhost:5000/api
```

## 🚢 Next Steps (Optional Enhancements)

- Add OCR for images (tesseract.js)
- Implement pagination in search results
- Add category/tag filtering UI
- File preview component
- Download progress indicator
- User profile / document ownership
- Sharing and permissions
- Full-text search highlighting
- Document deletion / archiving
- Bulk upload

---

**Need help?** Check backend logs in Terminal 1 or browser DevTools (F12) for frontend errors.
