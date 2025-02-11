import mongoose from "mongoose";

// Define SharedBucket schema
const sharedBucketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  allowedWorkspaces: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
  ],
  budget: {
    type: Number,
    required: true,
  },
  resources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
    },
  ],
});

// Method to add resources
sharedBucketSchema.methods.addResources = function (resources) {
  this.resources.push(...resources);
  return this.save();
};

// Method to allocate resources to a workspace
sharedBucketSchema.methods.allocateResources = function (workspaceId, count) {
  if (!this.allowedWorkspaces.includes(workspaceId)) {
    throw new Error("Workspace not permitted to access this bucket.");
  }

  if (this.resources.length < count) {
    throw new Error("Not enough resources available.");
  }

  const allocatedResources = this.resources.splice(-count, count);
  return this.save().then(() => allocatedResources);
};

// Define models
const SharedBucket = mongoose.model("SharedBucket", sharedBucketSchema);
export default SharedBucket;
