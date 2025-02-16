document.addEventListener("DOMContentLoaded", function () {
    const openCreateForm = document.getElementById("openCreateForm");
    const closeCreateForm = document.querySelector(".btn-close");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const toggleEditBtn = document.getElementById("openUpdateForm");
    let isEditing = false;
    let originalData = new Map(); // Store original task data
    const deleteAllTasksBtn = document.getElementById("deleteAllTasksBtn");


    if (openCreateForm) {
        openCreateForm.addEventListener("click", function () {
            document.getElementById("taskModal").style.display = "block";
        });
    }

    if (closeCreateForm) {
        closeCreateForm.addEventListener("click", function () {
            document.getElementById("taskModal").style.display = "none";
        });
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", function () {
            const taskName = document.getElementById("taskName").value;
            const category = document.getElementById("category").value;
            const status = document.getElementById("status").value;
            const dueDate = document.getElementById("dueDate").value;
            const description = document.getElementById("description").value;

            if (taskName.trim() === "" || category.trim() === "" || status.trim() === "" || dueDate.trim() === "" || description.trim() === ""){
                alert("All the details are required!");
                return;
            }

            console.log("Task Added:", { taskName, category, status, dueDate, description });
             const taskData = {
                title: taskName,
                description: description,
                category: category,
                due_date: dueDate,
                status: status
            };
            console.log(taskData);

            // Send data to backend using fetch
           fetch("http://localhost:3000/tasks/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                     title: taskName,
                    description: description,
                    category: category,
                    due_date: dueDate,
                    status: status
                })
            })
            .then(response => response.json())
            .then(data => console.log("Task Added:", data))
            .catch(error => console.error("Error:", error));


            // Hide modal
            const modalElement = document.getElementById("taskModal");
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById("taskName").value=null;
            document.getElementById("category").value=null;
            document.getElementById("status").value=null;
            document.getElementById("dueDate").value=null;
            document.getElementById("description").value=null;


        });
    }




    toggleEditBtn.addEventListener("click", function () {
        const taskRows = document.querySelectorAll("tr[data-task-id]");

        if (!isEditing) {
            // Store original data and enable inputs
            taskRows.forEach(row => {
                const taskId = row.getAttribute("data-task-id");
                originalData.set(taskId, {
                    title: row.querySelector(".task-title").value,
                    category: row.querySelector(".task-category").value,
                    due_date: row.querySelector(".task-due-date").value,
                    description: row.querySelector(".task-description").value,
                    status: row.querySelector(".task-status").value
                });

                row.querySelectorAll(".task-text").forEach(textContainer => textContainer.style.display = "none");
                row.querySelectorAll(".task-input").forEach(inputContainer => inputContainer.style.display = "block");
            });

            toggleEditBtn.textContent = "Save Changes";
        } else {
            // Collect only modified tasks
            const updatedTasks = [];
            taskRows.forEach(row => {
                const taskId = row.getAttribute("data-task-id");

                const newData = {
                    id: taskId,
                    title: row.querySelector(".task-title").value,
                    category: row.querySelector(".task-category").value,
                    due_date: row.querySelector(".task-due-date").value,
                    description: row.querySelector(".task-description").value,
                    status: row.querySelector(".task-status").value
                };

                  if (newData.title.trim() === "" || newData.category.trim() === "" || newData.due_date.trim() === "" || newData.status.trim() === "" || newData.description.trim() === ""){
                    alert("All the details are required!");
                    return;
                }

                // Compare new data with original data, only update if changed
                const original = originalData.get(taskId);
                if (
                    newData.title !== original.title ||
                    newData.category !== original.category ||
                    newData.due_date !== original.due_date ||
                    newData.description !== original.description ||
                    newData.status !== original.status
                ) {
                    updatedTasks.push(newData);
                }
            });

            // Send only modified tasks
            if (updatedTasks.length > 0) {
                fetch("http://localhost:3000/tasks/update", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tasks: updatedTasks })
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Tasks Updated:", data);
                    alert("Updated " + updatedTasks.length + " task(s) successfully!");
                    window.location.reload(); // Refresh page to show updated tasks
                })
                .catch(error => {
                    console.error("Error updating tasks:", error);
                    alert("Failed to update tasks.");
                });
            } else {
                alert("No changes detected.");
            }

            // Disable inputs again
            taskRows.forEach(row => {
                row.querySelectorAll(".task-text").forEach(textContainer => textContainer.style.display = "block");
                row.querySelectorAll(".task-input").forEach(inputContainer => inputContainer.style.display = "none");
            });

            toggleEditBtn.textContent = "Update Task";
        }

        isEditing = !isEditing;
    });


    document.querySelectorAll(".delete-task-btn").forEach(button => {
        button.addEventListener("click", function () {
            const row = this.closest("tr");
            const taskId = row.getAttribute("data-task-id");

            if (confirm("Are you sure you want to delete this task?")) {
                fetch(`http://localhost:3000/tasks/delete/${taskId}`, {
                    method: "DELETE"
                })
                .then(response => response.json())
                .then(data => {
                    alert("Task deleted successfully!");
                    window.location.reload();
                })
                .catch(error => {
                    alert("Failed to delete task.");
                });
            }
        });
    });

    if (deleteAllTasksBtn) {
        deleteAllTasksBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to delete ALL tasks? This action cannot be undone!")) {
                fetch("http://localhost:3000/tasks/deleteAll", {
                    method: "DELETE"
                })
                .then(response => response.json())
                .then(data => {
                    alert("All tasks deleted successfully!");
                    window.location.reload(); // Refresh page to show empty table
                })
                .catch(error => {
                    console.error("Error deleting all tasks:", error);
                    alert("Failed to delete tasks.");
                });
            }
        });
    }
});
