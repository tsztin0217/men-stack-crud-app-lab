const dotenv = require("dotenv"); // require package
dotenv.config(); // loads the environment variables from .env file
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const port = process.env.PORT ? process.env.PORT : "3000";
const authController = require("./controllers/auth.js");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false })); // body parser middleware
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
        }),
    })
);

app.use(passUserToView);
app.use(express.static("public"));

const Entry = require("./models/entry.js");

app.get("/", async (req, res) => {
    const allEntries = await Entry.find();
    res.render("index.ejs");
})

app.use("/auth", authController);


app.get("/entries", async (req, res) => {
    const allEntries = await Entry.find();
    res.render("entries/index.ejs", {
        entries: allEntries
    }
    );
});

app.get("/entries/new", isSignedIn, (req, res) => {
    res.render("entries/new.ejs");
});

app.post("/entries", async (req, res) => {
    console.log(req.body);
    let categories = req.body.categories || []; // Get selected checkboxes

    await Entry.create({
        title: req.body.title,
        date: req.body.date,
        mood: req.body.mood,
        content: req.body.content,
        categories: categories,
    });
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

app.get("/vip-lounge", isSignedIn, (req, res) => {
    res.send(`Welcome to the party, ${req.session.user.username}.`);
  });

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});