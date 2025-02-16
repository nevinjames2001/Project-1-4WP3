document.addEventListener("DOMContentLoaded", function () {
    const openCreateForm = document.getElementById("openCreateForm");
    const closeCreateForm = document.querySelector(".btn-close");
    const addTaskBtn = document.getElementById("addTaskBtn");

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

            if (taskName.trim() === "" || category.trim() === "") {
                alert("Task Name and Category are required!");
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
});
