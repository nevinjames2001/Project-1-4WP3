document.addEventListener("DOMContentLoaded", function () {
    const toggleEditBtn = document.getElementById("openUpdateForm");
    let isEditing = false;
    
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

});