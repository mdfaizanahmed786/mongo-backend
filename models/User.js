const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },

  age: {
    type: Number,
    required: true,
    // min: 1,
    // max: 120,
    // validate: {
    //   validator: (value) => value > 0,
    //   message: (props) => `${props.value} should not be negative`,
    // },
  },

  email: {
    type: String,
    required: true,
    // minLength: 10,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    // immutable: true,
  },
});

module.exports = mongoose.model("users", UserSchema);
