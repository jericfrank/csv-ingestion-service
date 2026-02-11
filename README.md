# 🚀 CSV Ingestion Microservice

A high-performance CSV ingestion service built with **Express, BullMQ, Redis, and streaming parsing**, designed to process **millions of CSV rows in seconds without performance issues**.

---

## ⚡ What It Does

* Accepts CSV uploads via `POST /upload`
* Streams the file (no memory overload)
* Splits rows into batches (1000 rows per batch – configurable sample value)
* Processes batches concurrently
* Inserts into the database efficiently
* Automatically retries failed jobs
* Logs total processing duration
* Cleans up uploaded files after processing

---

## 🏗 How It Works

1. File is uploaded to the Express API.
2. A **splitter worker** streams the CSV and batches rows.
3. Each batch is sent to the **insertion worker**.
4. Data is transformed and inserted into the database.
5. When the last batch completes, total duration is logged:

```ts
console.log(`[FINISH] Duration: ${durationSeconds}s | File: ${originalName}`);
```

---

## 🔄 Custom Data Transformation

All row formatting happens inside:

```
TransformData
```

You can modify this function to:

* Rename or map fields
* Convert types
* Add computed values
* Validate data
* Filter unwanted rows

This is the main customization point for adapting the CSV to your database schema.

---

## 🏁 Extending Completion Logic

When processing finishes, you can extend:

```ts
console.log(`[FINISH] Duration: ${durationSeconds}s | File: ${originalName}`);
```

At this point, you can:

* Send a webhook
* Update a database status to “completed”
* Trigger another job
* Send notifications
* Log analytics
* Publish an event

This makes it easy to integrate into larger systems.

---

## 🐳 Run with Docker

To start everything using Docker:

```bash
docker-compose up --build
```

Once containers are running, the API will be available at:

```
http://localhost:3000
```

---

## 🧪 Ready to Test

### Using cURL

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@your-file.csv"
```

### Using Postman
<img width="400" alt="image" src="https://github.com/user-attachments/assets/8a3b932d-5f79-48ad-8bdd-96583dd77d49" />

1. Method: `POST`
2. URL: `http://localhost:3000/upload`
3. Body → `form-data`
4. Key: `file`
5. Type: `File`
6. Select your CSV file
7. Send

Response:

```json
{
  "message": "Processing started",
  "file": "your-file.csv"
}
```


Built for production-grade, high-volume data imports.
