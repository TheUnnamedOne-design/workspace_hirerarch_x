import express from "express";
import mongoose from "mongoose";

import Workspace from "./models/workspace.js"; // Import the Workspace model
import SharedBucket from "./models/SharedBuckets.js"; // Import the SharedBucket model

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Middleware to parse JSON
app.use(express.json());

// Enable CORS (for frontend-backend communication)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins (for development)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/*============================== WORKSPACE ROUTES ==============================*/

// Route to create a new workspace
app.post("/workspaces", async (req, res) => {
  try {
    const { name, encrypted_key, id, idno } = req.body;

    const newWorkspace = new Workspace({
      name,
      encrypted_key,
      id,
      idno,
    });

    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (error) {
    console.error("Error saving workspace:", error);
    res.status(500).json({ message: "Failed to save workspace" });
  }
});

// Route to get all workspaces
app.get("/workspaces", async (req, res) => {
  try {
    const workspaces = await Workspace.find();
    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces" });
  }
});

// Route to update a workspace
app.put("/workspaces/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedWorkspace = await Workspace.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedWorkspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Failed to update workspace" });
  }
});

// Route to delete a workspace
app.delete("/workspaces/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWorkspace = await Workspace.findByIdAndDelete(id);

    if (!deletedWorkspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ message: "Failed to delete workspace" });
  }
});

/*============================== SHARED BUCKET ROUTES ==============================*/

// Route to create a new shared bucket
app.post("/sharedbuckets", async (req, res) => {
  try {
    const { name, allowedWorkspaces, budget, resources } = req.body;

    const bucket = new SharedBucket({ name, allowedWorkspaces, budget, resources });
    await bucket.save();
    res.status(201).json(bucket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get all shared buckets
app.get("/sharedbuckets", async (req, res) => {
  try {
    const buckets = await SharedBucket.find();
    res.status(200).json(buckets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shared buckets" });
  }
});

// Route to add resources to a shared bucket
app.post("/sharedbuckets/:id/add-resources", async (req, res) => {
  try {
    const { resources } = req.body;
    const bucket = await SharedBucket.findById(req.params.id);
    if (!bucket) return res.status(404).json({ error: "Bucket not found" });

    await bucket.addResources(resources);
    res.json({ message: "Resources added successfully", bucket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to allocate resources to a workspace
app.post("/sharedbuckets/:id/allocate", async (req, res) => {
  try {
    const { workspaceId, count } = req.body;
    const bucket = await SharedBucket.findById(req.params.id);
    if (!bucket) return res.status(404).json({ error: "Bucket not found" });

    const allocatedResources = await bucket.allocateResources(workspaceId, count);
    res.json({ allocatedResources });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to delete a shared bucket
app.delete("/sharedbuckets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBucket = await SharedBucket.findByIdAndDelete(id);

    if (!deletedBucket) {
      return res.status(404).json({ message: "Shared Bucket not found" });
    }

    res.status(200).json({ message: "Shared Bucket deleted successfully" });
  } catch (error) {
    console.error("Error deleting shared bucket:", error);
    res.status(500).json({ message: "Failed to delete shared bucket" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
