const dotenv = require("dotenv"); // require package
dotenv.config(); // loads the environment variables from .env file
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false })); // body parser middleware
app.use(methodOverride("_method"));
app.use(morgan("dev"));

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

app.get("/entries/:entryId/edit", async (req, res) => {
    const foundEntry = await Entry.findById(req.params.entryId);
    res.render("entries/edit.ejs", {
        entry: foundEntry
    });
});

app.put("/entries/:entryId", async (req, res) => {
    await Entry.findByIdAndUpdate(req.params.entryId, req.body);
    res.redirect(`/entries/${req.params.entryId}`);
})

app.get("/entries/:entryId", async (req, res) => {
    const foundEntry = await Entry.findById(req.params.entryId);
    res.render("entries/show.ejs", { entry: foundEntry });
});

app.delete("/entries/:entryId", async (req, res) => {
    await Entry.findByIdAndDelete(req.params.entryId);
    res.redirect("/entries");
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});