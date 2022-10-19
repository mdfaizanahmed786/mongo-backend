const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Note");

// Route 1: creating notes with validation and using middleware to ensure our route is protected.

router.post(
  "/createNotes",
  [
    body("title", "Please enter a valid title").isLength({ min: 3 }),
    body("description", "Description is too short").isLength({ min: 4 }),
  ],
  fetchUser,
  async (req, res) => {
    try {
      // fetching the id from the middleware
      const id = req.user.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //  creating notes
      const notes = await Notes.create({
        user: id,
        title: req.body.title,
        description: req.body.description,
      });
      //  saving the notes.
      await notes.save();

      //  sending back the notes.
      res.json(notes);
    } catch (er) {
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route2: Fetching the notes from the db. again we are using the middleware to properly authenticate the user and protect our routes.

router.get("/getNotes", fetchUser, async (req, res) => {
  try {
    const id = req.user.id;
    const notes = await Notes.find({ user: id });
    // if there are no notes available, return the error message.
    if (!notes) return res.status(404).send("Error fetching notes!");
    res.json(notes);
  } catch (er) {
    res.status(500).send("Internal Server Error");
  }
});

// Route 3: Updating the existing the notes.
router.put("/updateNotes/:id", fetchUser, async (req, res) => {
  try {
    // note that we need to add content-type application/json, auth-token as jwt and we need to add body as well because we are taking data from the request.body

    let newNote = {};
    const { title, description } = req.body;
    if (title) newNote.title = title;
    if (description) newNote.description = description;

    // now checking the specific user is updating his respective note only.
    const notes = await Notes.findById(req.params.id);
    // first and for most we are checking if the notes are available or not.
    if (!notes) return res.status(404).json({ error: "Not found" });
    // if notes are available, we are checking the user owns or not
    if (notes.user.toString() !== req.user.id)
      return res.status(401).send("Not Allowed");

    // now we have notes available, so now we can update it. new true means that it is possible to update the notes
    const userNotes = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(userNotes);
  
  } catch (er) {
    res.status(500).send("Internal Server Error");
  }
});

// Route 4: Deleting the Notes.
router.delete("/deleteNotes/:id", fetchUser, async (req, res) => {
  try {
    // now checking the specific user is deleting his respective note only.
    const notes = await Notes.findById(req.params.id);
    // first and for most we are checking if the notes are available or not.
    if (!notes) return res.status(404).json({ error: "Not found" });
    // if notes are available, we are checking the user owns or not
    if (notes.user.toString() !== req.user.id)
      return res.status(401).send("Not Allowed");

    // now we have notes available, so now we can update it. new true means that it is possible to update the notes
    await Notes.findByIdAndDelete(req.params.id);
    res.status(200).json({ Success: "Notes have been deleted" });
  } catch (er) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
