document.addEventListener("DOMContentLoaded", function () {
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

});