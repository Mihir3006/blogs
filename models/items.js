const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    title: String,
    post: String
})

//define models for blogs
const Item = mongoose.model("Item", itemsSchema);

module.exports = itemsSchema;