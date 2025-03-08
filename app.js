const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const tasksRoutes = require("./routes/tasks");

const app = express();
const PORT = 3000;


// Set up Mustache as view engine
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", "./views");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json()); // Support JSON request bodies
app.use("/", tasksRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
