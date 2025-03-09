document.addEventListener("DOMContentLoaded", function () {
    const toggleEditBtn = document.getElementById("openUpdateForm");
    let isEditing = false;
      const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");

    let table = $("#taskTable").DataTable({
        responsive: true,
        autoWidth: false,
        lengthChange: false,
        pageLength: 5, // Default rows per page
        ordering: true,
        order:[[2,"asc"]],
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
        const estimated_hours = document.getElementById("estimated_hours").value;

        if (!taskName || !category || !status || !dueDate || !description || !estimated_hours) {
            alert("All fields are required!");
            return;
        }

        // Send data to backend
        fetch("/tasks/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: taskName, category, status, due_date: dueDate, description,estimated_hours })
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
            // Enable inputs
            taskRows.forEach(row => {
                row.querySelectorAll(".task-text").forEach(textContainer => textContainer.style.display = "none");
                row.querySelectorAll(".task-input").forEach(inputContainer => inputContainer.style.display = "block");
            });

            toggleEditBtn.textContent = "Save Changes";
        } else {
            // Collect updated data
            const updatedTasks = [];
            taskRows.forEach(row => {
                const taskId = row.getAttribute("data-task-id");

                updatedTasks.push({
                    id: taskId,
                    title: row.querySelector(".task-title").value,
                    category: row.querySelector(".task-category").value,
                    due_date: row.querySelector(".task-due-date").value,
                    description: row.querySelector(".task-description").value,
                    status: row.querySelector(".task-status").value,
                    estimated_hours: row.querySelector(".task-estimated_hours").value
                });
            });

            // Send updated tasks to the backend API
            fetch("http://localhost:3000/tasks/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tasks: updatedTasks })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Tasks Updated:", data);
                alert("Tasks updated successfully!");
                window.location.reload(); // Refresh the page to show updated tasks
            })
            .catch(error => {
                console.error("Error updating tasks:", error);
                alert("Failed to update tasks.");
            });

            // Disable inputs after saving
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