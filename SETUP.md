# Ans Anime — Media Embedding & Video Upload Guide

## How to Add Embed Links & Upload Videos in the Admin Panel

Ans Anime provides two powerful methods for adding video streams directly inside the **Admin Panel**:

---

### Option 1: Paste Embed Link / `<iframe>` Snippet (Recommended for Web Hosting)

1. Click **"Admin Panel"** in the footer (or the Shield icon in the top right).
2. Click the white **"Media Embedding & Video Manager"** button (or click **"Embed Video"** on any anime row).
3. Under **Choose Media Source Mode**, select **"Option 1: Paste Embed Link / <iframe>"**.
4. Paste your video embed link or raw `<iframe>` code into the input box:
   - **YouTube**: Paste standard links (`https://youtube.com/watch?v=...`), short links (`https://youtu.be/...`), or embed links (`https://youtube.com/embed/...`).
   - **Google Drive**: Share video &rarr; select *"Anyone with the link can view"* &rarr; paste the link (`https://drive.google.com/file/d/.../view`). Ans Anime auto-converts it to `/preview`!
   - **Video Streaming Hosts**: Streamtape (`https://streamtape.com/e/XXXX/`), DoodStream, Mega.nz, Vimeo, Dailymotion, Filemoon, or Vidcloud.
   - **Direct Video Stream**: Any direct `.mp4`, `.webm`, or `.mkv` link from Wasabi, Backblaze, BunnyCDN, or any web server.
   - **Raw `<iframe>` tags**: Simply paste `<iframe src="..." allowfullscreen></iframe>` — the sanitizer automatically extracts the clean streaming URL for you!
5. Click **"Preview"** to test playback directly in the window.
6. Enter the **EP Number**, an optional **Episode Title**, and click **"Save & Publish Episode"**.

---

### Option 2: Upload Video File Directly (.mp4, .webm, .mkv)

1. In the **Media Embedding & Video Manager**, select **"Option 2: Upload Video File (.mp4/.webm)"**.
2. Click the dropzone or drag and drop any `.mp4`, `.webm`, or `.mkv` video file from your computer.
3. The video file is stored securely in your browser's high-capacity **IndexedDB media database** (supporting large multi-hundred megabyte and gigabyte video files).
4. Enter the **EP Number** and **Episode Title**.
5. Click **"Save & Publish Episode"** &rarr; you can immediately watch it in full HD with HTML5 video controls!

---

### Quick 1-Click Tested Sample Streams
Inside the Media Embedding modal, you can click any of the instant test buttons to verify player functionality:
- **Trailer 1 (Solo Leveling)**: Official Solo Leveling 1080p stream
- **Trailer 2 (Demon Slayer)**: Official Demon Slayer Swordsmith Arc 1080p stream
- **Direct MP4 Stream**: High-speed direct MP4 HTML5 playback

---

### Master Admin Security & Database Backups
- **Single Master Admin**: The first time you visit the Admin Portal (`/admin`), you can register your master admin email and password.
- Once registered, public registration is **permanently locked**, securing your anime library.
- **Admin-Only Database Backups**: The **"Database Backup & Restore"** utility is located exclusively in the **Admin Dashboard** (removed from public web). You can export `.json` snapshots, restore from previously saved files, and reset to defaults anytime.
