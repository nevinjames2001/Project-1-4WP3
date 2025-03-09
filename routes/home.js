const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home", {
        title: "Welcome to Task Manager",
        bannerImage: "/images/Task manager.svg"  // Path inside "public/images/"
    });
});

module.exports = router;
