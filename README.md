# 🚀 CSV Ingestion Microservice

A high-performance, production-ready CSV ingestion service built with **TypeScript, Express, BullMQ, PostgreSQL, Redis, and streaming parsing**. Designed to process **millions of CSV rows efficiently** with clean architecture and proper error handling.

---

## ⚡ Features

* 📤 **File Upload API** - Accepts CSV uploads via `POST /upload`
* 🌊 **Streaming Processing** - Streams files to avoid memory overload
* 📦 **Batch Processing** - Splits rows into batches (1000 rows per batch - configurable)
* ⚡ **Concurrent Workers** - Processes 5 batches concurrently
* 🔄 **Automatic Retries** - 3 attempts with exponential backoff
* 📊 **Structured Logging** - Clean, contextual logs with timestamps
* 🧹 **Auto Cleanup** - Removes uploaded files after processing
* 🏗️ **Clean Architecture** - Modular structure with separation of concerns
* 🐳 **Docker Ready** - Fully containerized with Docker Compose

---

## 📁 Project Structure

```
src/
├── index.ts                      # Application entry point
├── config.ts                     # Environment configuration
├── db.ts                         # Database connection (Knex)
├── redis.ts                      # Redis connection
├── types.ts                      # TypeScript type definitions
│
├── constants/
│   └── index.ts                  # Configuration constants
│
├── utils/
│   ├── logger.ts                 # Structured logging utility
│   └── error-handler.ts          # Error handling utilities
│
├── queues/
│   └── queue-factory.ts          # BullMQ queue configuration
│
├── workers/
│   ├── csv-splitter.worker.ts    # CSV parsing & batching
│   └── db-insertion.worker.ts    # Database insertion
│
└── routes/
    └── upload.routes.ts          # File upload endpoint
```

---

## 🏗 How It Works

1. **Upload** - File is uploaded to the Express API
2. **Queue Job** - Upload handler enqueues a splitter job
3. **CSV Splitting** - Splitter worker streams and batches the CSV (1000 rows/batch)
4. **Batch Queueing** - Each batch is enqueued for insertion
5. **Concurrent Insertion** - 5 insertion workers process batches in parallel
6. **Transformation** - Data is transformed via `TransformData` function
7. **Database Insert** - Batch is inserted into PostgreSQL
8. **Completion** - Final batch triggers completion log with duration

**Log Output Example:**
```
[2026-02-11T15:56:18.743Z] [INFO] [CSV_SPLITTER] Processing file: customers-2000000.csv
[2026-02-11T15:56:18.743Z] [INFO] [CSV_SPLITTER] Completed processing | {"file":"customers-2000000.csv","totalRows":2000000}
[2026-02-11T15:56:18.743Z] [INFO] [DB_INSERTION] File processing completed | {"file":"customers-2000000.csv","duration":"28.57s"}
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Application
PORT=3000

# PostgreSQL
DB_HOST=postgres
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=csv_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Adjustable Constants

Modify [`src/constants/index.ts`](src/constants/index.ts) to customize:

```typescript
export const PROCESSING_CONFIG = {
  BATCH_SIZE: 1000,              // Rows per batch
  INSERTION_CONCURRENCY: 5,      // Parallel workers
};

export const JOB_CONFIG = {
  ATTEMPTS: 3,                   // Retry attempts
  BACKOFF_DELAY: 1000,           // Initial retry delay (ms)
};
```

---

## 🔄 Custom Data Transformation

Modify [`src/types.ts`](src/types.ts) to adapt CSV format to your database schema:

```typescript
export const TransformData = (row: CsvRow): TableRecord => ({
  first_name: row['First Name'],
  last_name: row['Last Name'],
  email: row['Email'],
  // Add custom transformations:
  // created_at: new Date().toISOString(),
  // is_active: row['Status'] === 'Active',
});
```

**Use Cases:**
- Rename or map fields
- Convert data types
- Add computed values
- Apply validation
- Filter unwanted rows

---

## 🏁 Extending Completion Logic

When processing finishes, extend the completion handler in [`src/workers/db-insertion.worker.ts`](src/workers/db-insertion.worker.ts):

```typescript
if (last) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.info('DB_INSERTION', `File processing completed`, {
    file: originalName,
    duration: `${duration}s`,
  });

  // Add your custom logic here:
  // - Send webhook notification
  // - Update job status in database
  // - Trigger downstream processing
  // - Send email notification
  // - Publish event to message broker
}
```

---

## 🚀 Quick Start (Plug & Play)

**Just run this command and you're ready:**

```bash
docker compose up
```

That's it! Everything (PostgreSQL, Redis, API, DB Admin) starts automatically.

### 🎯 What's Running:

- **API**: `http://localhost:3000`
- **Database Admin**: `http://localhost:8080` (Adminer)
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

---

## 🧪 Test It Right Away

### Upload a CSV:

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@your-file.csv"
```

**Response:**
```json
{
  "message": "Processing started",
  "file": "your-file.csv"
}
```

### Using Postman:

<img width="400" alt="image" src="https://github.com/user-attachments/assets/8a3b932d-5f79-48ad-8bdd-96583dd77d49" />

1. **POST** `http://localhost:3000/upload`
2. Body → `form-data`
3. Key: `file` (Type: File)
4. Select your CSV
5. Send

### Expected CSV Format:

```csv
First Name,Last Name,Company,City,Country,Phone 1,Phone 2,Email,Subscription Date,Website
```

### Check the Data:

1. Go to `http://localhost:8080` (Adminer)
2. Login:
   - System: **PostgreSQL**
   - Server: **postgres**
   - Username: **postgres**
   - Password: **postgres**
   - Database: **csv_db**
3. Query: `SELECT * FROM records;`

---

## ⚙️ Configuration

### Adjust Performance:

Edit [`src/constants/index.ts`](src/constants/index.ts):

```typescript
export const PROCESSING_CONFIG = {
  BATCH_SIZE: 1000,           // Rows per batch
  INSERTION_CONCURRENCY: 5,   // Parallel workers
};
```

### Customize Data Mapping:

Edit [`src/types.ts`](src/types.ts) - the `TransformData` function.

### Environment Variables:

Copy `.env.example` to `.env` and adjust if needed (default values work out of the box).

---

## 📊 Monitoring

**Watch logs in real-time:**

```bash
docker logs -f node-app
```

**Example output:**
```
[INFO] [CSV_SPLITTER] Processing file: customers-2000000.csv
[INFO] [CSV_SPLITTER] Completed processing | {"totalRows":2000000}
[INFO] [DB_INSERTION] File processing completed | {"duration":"28.57s"}
```

---

**Built for production-grade, high-volume data imports** 🚀
