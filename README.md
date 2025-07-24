# TikTok Downloader API

A lightweight REST API that extracts metadata and the **no-watermark download link** for TikTok videos using web scraping via [https://www.tikwm.com](https://www.tikwm.com).

---

## 🛠 Requirements

- Nodejs
- Dependencies: `express`, `axios`, `cheerio`

Install them with:

```bash
npm install
```

---

## 🚀 Getting Started

1. git clone https://github.com/IsaiRuano/TikTok-DL-API-scraping.git
2. Install dependencies.
3. Run the server:

```bash
npm start
```

The server will start on:

```
http://localhost:3000/
```

---

## 📡 Endpoint

### `GET /api/download`

#### Example Request

```http
GET http://localhost:3000/api/download?url=https://www.tiktok.com/@username/video/7527633747622006029
```

---

## ✅ Successful Response (200 OK)

```json
{
  "videoId": "7527633747622006029",
  "username": "username",
  "nickname": "Display Name",
  "title": "@username: Example video description",
  "region": "US",
  "createdAt": "Wednesday 16 July 2025 11:03:45 GMT",
  "downloadLink": "https://www.tikwm.com/video/media/play/7527633747622006029.mp4",
  "music": {
    "url": "https://www.tikwm.com/video/music/7527633747622006029.mp3"
  },
  "stats": {
    "views": 2100000,
    "likes": 351200,
    "comments": 6160,
    "shares": 195633
  }
}
```

---

## ❌ Error Responses

### `400 Bad Request`

```json
{
  "error": "Missing ?url= parameter with a valid TikTok video URL."
}
```

### `404 Not Found`

```json
{
  "error": "No no-watermark download link found."
}
```

### `500 Internal Server Error`

```json
{
  "error": "Unexpected error."
}
```

---

## 📌 Notes

- Works for URLs https://vt.tiktok.com, https://www.tiktok.com/?is_from_webapp=1&sender_device=pc, https://vm.tiktok.com
- Only public TikTok video data is scraped (via TikWM).
- This service depends on TikWM’s HTML structure—changes may require selector updates.

---
