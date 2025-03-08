const dotenv = require("dotenv"); // require package
dotenv.config(); // loads the environment variables from .env file
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false })); // body parser middleware
const Entry = require("./models/entry.js");

app.get("/", async (req, res) => {
    const allEntries = await Entry.find();
    res.render("index.ejs");
})

app.get("/entries", async (req, res) => {
    const allEntries = await Entry.find();
    res.render("entries/index.ejs", {
        entries: allEntries}
    );
});

app.get("/entries/new", (req, res) => {
    res.render("entries/new.ejs");
});

app.post("/entries", async (req, res) => {
    console.log(req.body);
    await Entry.create(req.body);
    res.redirect("/entries");
});

app.get("/entries/:entryId", async (req, res) => {
    const foundEntry = await Entry.findById(req.params.entryId);
    res.render("entries/show.ejs", { entry: foundEntry });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});