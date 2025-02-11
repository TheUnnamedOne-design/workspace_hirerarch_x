import mongoose from "mongoose";

// Define the Workspace schema
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Workspace name is mandatory
      trim: true, // Removes unnecessary whitespace
    },
    encrypted_key: {
      type: String,
      required: true, // Encrypted key is mandatory
    },
    id: {
      type: String,
      required: true, // Workspace ID is mandatory
    },
    idno: {
      type: Number,
      required: true, // Workspace ID number is mandatory
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Reference to the Task model
      },
    ],
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission", // Reference to the Permission model
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    child_workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace", // Self-referencing for child workspaces
      },
    ],
    parent_workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace", // Self-referencing for parent workspaces
      },
    ],
    signature: {
      type: String,
      default: "", // Optional field for workspace signature
    },
    sign: {
      type: Number,
      default: 0, // Optional field for workspace sign
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Method to assign a parent workspace
workspaceSchema.methods.assignParent = function (parentId) {
  this.parent_workspaces.push(parentId);
  return this.save();
};

// Method to assign a child workspace
workspaceSchema.methods.assignChild = function (childId) {
  this.child_workspaces.push(childId);
  return this.save();
};

// Method to display workspace information
workspaceSchema.methods.displayInfo = function () {
  console.log("Child Workspaces:", this.child_workspaces);
  console.log("Parent Workspaces:", this.parent_workspaces);
  console.log("Current Workspace:", this.id);
};

// Method to get the workspace ID
workspaceSchema.methods.getWorkspaceId = function () {
  return this.encrypted_key;
};

// Method to update workspace information
workspaceSchema.methods.updateInfo = function () {
  let assign_id = "(";
  this.parent_workspaces.forEach((parent) => {
    assign_id += parent.id + "|";
  });
  assign_id += ")";

  const cid = this.idno.toString();
  assign_id += "->" + cid;

  // Simulate encryption (replace with actual encryption logic)
  const encr = assign_id.split("").reverse().join(""); // Example encryption
  this.encrypted_key = encr;
  this.id = assign_id;

  return this.save();
};




// Create the Workspace model
const Workspace = mongoose.model("Workspace", workspaceSchema);

// Export the model
export default Workspace;