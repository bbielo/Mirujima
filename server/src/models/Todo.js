const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 80 },
        done: { type: Boolean, default: false },
        date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    },
    { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);