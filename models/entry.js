const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
    title: String,
    date: Date,
    mood: String,
    content: String,
    categories: [String]
});

const Entry = mongoose.model("Entry", entrySchema);


module.exports = Entry;
