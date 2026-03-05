// server/index.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for frontend (adjust origin as needed)
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// ----- Todos API (CRUD) -----
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");
const TODOS_COLLECTION = "todos";

// GET /api/todos – list all todos
app.get("/api/todos", async (req, res) => {
  try {
    const collection = getDb().collection(TODOS_COLLECTION);
    const todos = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(todos);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos – create a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const title = req.body?.title;
    const trimmed = typeof title === "string" ? title.trim() : "";
    if (!trimmed) {
      return res.status(400).json({ error: "title is required and must be non-empty" });
    }
    const doc = {
      title: trimmed,
      completed: Boolean(req.body?.completed),
      createdAt: new Date(),
    };
    const collection = getDb().collection(TODOS_COLLECTION);
    const result = await collection.insertOne(doc);
    const inserted = { _id: result.insertedId, ...doc };
    res.status(201).json(inserted);
  } catch (err) {
    console.error("POST /api/todos error:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// DELETE /api/todos/:id – delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid todo id" });
    }
    const collection = getDb().collection(TODOS_COLLECTION);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/todos error:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Server configuration
const PORT = process.env.PORT || 5002;

async function startServer() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();


