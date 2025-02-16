document.addEventListener("DOMContentLoaded", function () {
    const toggleEditBtn = document.getElementById("openUpdateForm");
    let isEditing = false;
    let originalData = new Map(); // Store original task data
     const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");


    let table = $("#taskTable").DataTable({
        responsive: true,
        autoWidth: false,
        lengthChange: false,
        pageLength: 5, // Default rows per page
        ordering: true,
        columnDefs: [{ targets: [5], orderable: false }], // Disable sorting on actions column
        language: {
            searchPlaceholder: "Search tasks...",
        }
    });

    // Open Create Form Modal
    document.getElementById("openCreateForm").addEventListener("click", function () {
        document.getElementById("taskModal").style.display = "block";
    });

    // Add Task
    document.getElementById("addTaskBtn").addEventListener("click", function () {
        const taskName = document.getElementById("taskName").value;
        const category = document.getElementById("category").value;
        const status = document.getElementById("status").value;
        const dueDate = document.getElementById("dueDate").value;
        const description = document.getElementById("description").value;

        if (!taskName || !category || !status || !dueDate || !description) {
            alert("All fields are required!");
            return;
        }

        // Send data to backend
        fetch("/tasks/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: taskName, category, status, due_date: dueDate, description })
        })
        .then(response => response.json())
        .then(data => {
            alert("Task Added Successfully!");
            location.reload(); // Refresh DataTable
        })
        .catch(error => console.error("Error:", error));
    });

    // Delete a Task
    $("#taskTable tbody").on("click", ".delete-task-btn", function () {
        let row = $(this).closest("tr");
        let taskId = row.attr("data-task-id");

        if (confirm("Are you sure you want to delete this task?")) {
            fetch(`/tasks/delete/${taskId}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => {
                table.row(row).remove().draw(); // Remove from DataTable
                alert("Task Deleted!");
            })
            .catch(error => console.error("Error deleting task:", error));
        }
    });

    // Delete All Tasks
    document.getElementById("deleteAllTasksBtn").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete ALL tasks?")) {
            fetch("/tasks/deleteAll", { method: "DELETE" })
            .then(response => response.json())
            .then(() => {
                table.clear().draw(); // Clear DataTable
                alert("All tasks deleted!");
            })
            .catch(error => console.error("Error deleting all tasks:", error));
        }
    });


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

      function filterTasks() {
        const selectedCategory = categoryFilter.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();

        document.querySelectorAll("tbody tr[data-task-id]").forEach(row => {
            const taskCategory = row.getAttribute("data-category").toLowerCase();
            const taskStatus = row.getAttribute("data-status").toLowerCase();

            // Check if the row matches the selected filters
            const matchesCategory = selectedCategory === "all" || taskCategory === selectedCategory;
            const matchesStatus = selectedStatus === "all" || taskStatus === selectedStatus;

            if (matchesCategory && matchesStatus) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    // Attach event listeners to the filter dropdowns
    categoryFilter.addEventListener("change", filterTasks);
    statusFilter.addEventListener("change", filterTasks);


});
