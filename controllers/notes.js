const Note = require('../models/notes');

exports.addNotes =  async (req, res) => {
    try {
      const { mainTitle, subTitle, subContent } = req.body;

      if (!mainTitle || !subContent || !subTitle) {
        return res.status(400).json({ error: "mainTitle and subContent, subTitle are required." });
      }


      const newNote = new Note({
        mainTitle,
        user: req.user._id.toString(),
        Contents: [
            {subTitle ,subContent }
        ],
      });
      const savedNote = await newNote.save();
  
      res.status(201).json({ message: "Note added successfully", note: savedNote });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.addSubNotes = async (req, res) => {
  try {
    const { subTitle, subContent } = req.body;
    const { id } = req.params;

    if (!subContent || !subTitle) {
      return res.status(400).json({ error: "subContent and subTitle are required." });
    }

    const mainNote = await Note.findById(id);

    if (!mainNote) {
      return res.status(404).json("No such note was found");
    }
    if (mainNote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    mainNote.Contents.push({ subTitle, subContent });
    mainNote.status = "pending";
    const savedNote = await mainNote.save();

    res.status(201).json({ message: "Sub-note added successfully", note: savedNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSubNotes = async (req, res) => {
  try {
    const { id, subId } = req.query;
    const { subTitle, subContent } = req.body;

    if (!subTitle || !subContent) {
      return res.status(400).json({ error: "subTitle and subContent are required." });
    }

    const mainNote = await Note.findById(id);

    if (!mainNote) {
      return res.status(404).json("No such note was found");
    }
    if (mainNote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    mainNote.status = "pending";
    const subNoteIndex = mainNote.Contents.findIndex(content => content._id == subId);

    if (subNoteIndex === -1) {
      return res.status(404).json("No such sub-note was found");
    }

    mainNote.Contents[subNoteIndex].subTitle = subTitle;
    mainNote.Contents[subNoteIndex].subContent = subContent;
    mainNote.Contents[subNoteIndex].status = "pending";

    const savedNote = await mainNote.save();

    res.status(200).json({ message: "Sub-note updated successfully", note: savedNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.updateMainHeading =  async (req, res) => {
    try {
      const { mainTitle } = req.body;
      const {id} = req.params;

      if (!mainTitle) {
        return res.status(400).json({ error: "mainTitle and subContent, subTitle are required." });
      }
      const note = await Note.findById(id);
      if(!note){
        res.status(404).json("no such note was found");
      }
      if (note.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      note.mainTitle = mainTitle;
      const savedNote = await note.save();
  
      res.status(201).json({ message: "Note Heading updated successfully", note: savedNote });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getOneMainNote = async(req, res) =>{
    try{
        const {id} = req.params;
        const note = await Note.findById(id);
        if(!note){
            res.status(404).json("no such note was found");
        }
        if (note.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        res.status(200).json(note);
    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.getOneSubNote = async(req, res) =>{
    try{
        const {id, subId} = req.query;
        console.log(id, subId);
        const mainNote = await Note.findById(id);
        if (!mainNote) {
            return res.status(404).json({ error: "Main note not found" });
        }
        if (mainNote.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        const subNote = await mainNote?.Contents?.find(content => content._id == subId);

        if (!subNote) {
            return res.status(404).json({ error: "Sub note not found" });
        }
        res.status(200).json(subNote);
    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.getNotes = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    let query = { user: req.user._id };

    if (status && status !== "viewall") {
      query = { ...query, status: status };
    }

    let sortQuery = {};

    if (sortBy && sortBy !== "date") {
      sortQuery["mainTitle"] = sortBy === "desc" ? -1 : 1;
    } else if (sortBy === "date") {
      sortQuery.updatedAt = -1;
    } else {
      sortQuery = {};
    }
    const notes = await Note.find(query).sort(sortQuery);

    if (!notes) {
      res.status(404).json("There are no notes currently");
    }

    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.deleteMainNote = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findByIdAndDelete(id);
    const allNote = await Note.find({user:req.user._id});

    if (!deletedNote) {
      return res.status(404).json("No such note was found");
    }

    if (deletedNote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json({ message: "Main note deleted successfully", note: allNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteSubNote = async (req, res) => {
  try {
    const { id, subId } = req.query;

    const mainNote = await Note.findById(id);

    if (!mainNote) {
      return res.status(404).json("No such note was found");
    }
    if (mainNote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const subNoteIndex = mainNote.Contents.findIndex(content => content._id == subId);

    if (subNoteIndex === -1) {
      return res.status(404).json("No such sub-note was found");
    }

    mainNote.Contents.splice(subNoteIndex, 1);

    const savedNote = await mainNote.save();

    res.status(200).json({ message: "Sub-note deleted successfully", note: savedNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.updateNoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json("No such note was found");
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    note.status = status;
    await note.save();

    if (status === 'completed') {
      note.Contents.forEach(content => {
        content.status = 'completed';
      });
    }

    await note.save();

    const allNote = await Note.find({user : req.user._id});

    res.status(200).json({ message: "Note status updated successfully", note: allNote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.updateContentStatus = async (req, res) => {
  try {
    const { id, subId } = req.query;
    const { status } = req.body;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json("No such note was found");
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const content = note.Contents.id(subId);

    if (!content) {
      return res.status(404).json("No such content was found");
    }

    content.status = status;

    const allContentsCompleted = note.Contents.every(content => content.status === 'completed');
    if (allContentsCompleted) {
      note.status = 'completed';
    } else {
      note.status = 'pending';
    }

    await note.save();

    res.status(200).json({ message: "Content status updated successfully", note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};