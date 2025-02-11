class Workspace {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.id = `ws-${Date.now()}`;
        this.children = [];
        this.parent = null;
    }

    assignParent(parent) {
        this.parent = parent;
        parent.children.push(this);
    }
}

const workspaceMap = {};
let rootWorkspaces = [];
let rootName = "Root"; // Default name

function setRootName() {
    const input = document.getElementById("rootName").value;
    if (input.trim()) {
        rootName = input.trim();
        updateVisualization();
    }
}

function createWorkspace() {
    const name = document.getElementById("workspaceName").value;
    const type = document.getElementById("workspaceType").value;
    const parentId = document.getElementById("parentWorkspace").value;

    if (!name) {
        alert("Enter a workspace name.");
        return;
    }

    const workspace = new Workspace(name, type);
    workspaceMap[workspace.id] = workspace;

    if (parentId) {
        let parentWorkspace = workspaceMap[parentId];
        if (parentWorkspace) {
            workspace.assignParent(parentWorkspace);
        }
    } else {
        rootWorkspaces.push(workspace);
    }

    updateParentSelection();
    updateVisualization();
}

function updateParentSelection() {
    const parentSelect = document.getElementById("parentWorkspace");
    parentSelect.innerHTML = `<option value="">None (Root)</option>`;

    Object.values(workspaceMap).forEach(ws => {
        let option = document.createElement("option");
        option.value = ws.id;
        option.textContent = ws.name;
        parentSelect.appendChild(option);
    });
}

function saveWorkspaces() {
    localStorage.setItem("rootWorkspaces", JSON.stringify(rootWorkspaces));
    localStorage.setItem("workspaceMap", JSON.stringify(workspaceMap));
    localStorage.setItem("rootName", rootName);
    alert("Workspaces saved!");
}

function loadWorkspaces() {
    let savedRoots = localStorage.getItem("rootWorkspaces");
    let savedMap = localStorage.getItem("workspaceMap");
    let savedRootName = localStorage.getItem("rootName");

    if (savedRoots && savedMap) {
        rootWorkspaces = JSON.parse(savedRoots);
        Object.assign(workspaceMap, JSON.parse(savedMap));
        if (savedRootName) rootName = savedRootName;
        updateParentSelection();
        updateVisualization();
    } else {
        alert("No saved data found.");
    }
}
