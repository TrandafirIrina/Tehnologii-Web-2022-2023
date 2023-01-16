const express = require("express");
const router = express.Router();
const {Op} = require("sequelize");
const multer = require("multer");
const upload = multer({dest:'uploads/'});

const sequelize = require("../sequelize"); //import din sequelize.js  baza de date
const Group = require("../models/group"); // import modelul pentru grup
const Note = require("../models/note"); // import modelul pentru note
const Student = require("../models/student"); // import modelul pentru student
const Tag = require("../models/tag"); // import modelul pentru tag (etichete)

Student.hasMany(Note); // Un student are mai multe notite
Note.hasMany(Tag); //O notita are mai multe etichete
Student.belongsToMany(Group, { through: "GroupRegistry" }); //Un student face parte din mai multe grupuri
Group.belongsToMany(Student, { through: "GroupRegistry" });//Un grup contine mai multi studenti, tabela jonctiune
                                                          //denumindu-se GroupRegistry
Group.belongsToMany(Note, { through: "GroupNotes" }); //Un grup contine mai multe notite
Note.belongsToMany(Group, { through: "GroupNotes" }); //O notita poata sa fie trimisa in mai multe grupuri, tabela jonctiune
                                                      // denumindu-se GroupNotes

//GET - pentru a crea tabele (si a le sterge daca existau deja si a le crea din nou)
router.get("/", async (req, res, next) => {
  try {
    await sequelize.sync({ force: true });
    res.status(200).json({ message: "The tables have been created!" });
  } catch (error) {
    next(error);
  }
});

router
  .route("/students")
  //GET - pentru a vedea studentii existenti
  .get(async (req, res, next) => {
    try {
      const students = await Student.findAll();
      if (students) {
        res.status(200).json(students);
      } else {
        res.status(404).json({ error: "Could not find students!" });
      }
    } catch (err) {
      next(err);
    }
  })
  //POST - pentru a adauga un student
  .post(async (req, res, next) => {
    try {
      const student = await Student.create(req.body);
      res.status(200).json({ message: "The student was added" });
    } catch (error) {
      next(error);
    }
  });

router
  .route("/students/:studentId")
  //GET - pentru afisarea studentului cu un anumit id
  .get(async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.studentId);
      if (student) {
        res.status(200).json(student);
      } else {
        res.status(404).json({
          error: `The student with id ${req.params.studentId} was not found`
        });
      }
    } catch (err) {
      next(err);
    }
  })
  //PUT - pentru editarea studentului cu un anume id
  .put(async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.studentId);
      if (student) {
        await student.update(req.body);
        res.status(200).json({
          message: `The student with the id ${req.params.studentId} was updated!`
        });
      } else {
        res.status(404).json({
          error: `The student with id ${req.params.studentId} was not found`
        });
      }
    } catch (err) {
      next(err);
    }
  })
  //DELETE - pentru stergerea unui anume student
  .delete(async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.studentId);
      if (student) {
        await student.destroy();
        res.status(200).json({
          message: `The student with the id ${req.params.studentId} was deleted`
        });
      } else {
        res.status(404).json({
          error: `The student with id ${req.params.studentId} was not found`
        });
      }
    } catch (err) {
      next(err);
    }
  });

router.route("/students/:studentId/notes")
//GET - pentru afisarea notitelor unui anumit student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      if(req.query.keyword){ // daca vreau sa caut notite dupa keyword-uri
        const notes = await student.getNotes({where:{content:{[Op.like]:`%${req.query.keyword}%`}}})
        if(notes){
          res.status(200).json(notes)
        }else{
          res.status(404).json({"error":`No notes with the keyword ${req.query.keyword} was found!`})
        }
      }else{
        const notes = await student.getNotes()
        if(notes){
          res.status(200).json(notes);
        }else{
          res.status(404).json({"error":"Notes not found!"})
        }
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
//POST - pentru adaugarea unei notite pentru un anume student
.post(upload.any(),async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const note = await Note.create({
        title: req.body.title,
        content: req.files.shift(),
        subject: req.body.subject
      });
      student.addNote(note);
      await student.save();
      res.status(200).json({message:"The note was added!"})
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(error){
    next(error)
  }
})


router.route("/students/:studentId/notes/:noteId")
//GET - pentru vizualizarea unei anumite notite a unui anumit student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        res.status(200).json(note)
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
// PUT - pentru editarea unei anumite notite a unui anumit student
.put(upload.single('content'),async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        await note.update(req.body);
        res.status(200).json({message:`The note with the id ${req.params.noteId} was updated`})
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
//DELETE - pentru stergerea unei anumite notite a unui anumit student
.delete(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        await note.destroy();
        res.status(200).json({message:`The note with the id ${req.params.noteId} was deleted`})
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})

router.route("/students/:studentId/notes/:noteId/tags")
// GET - pentru afisarea tuturor etichetelor ale unei anumite notite a unui anumit student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        const tags = await note.getTags()
        if(tags){
          res.status(200).json(tags);
        }else{
          res.status(404).json({"error":"No tags found"})
        }
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err);
  }
})
//POST - pentru adaugarea de etichete pentru o anumita notita a unui anumit student
.post(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        const tag = await Tag.create(req.body)
        note.addTag(tag)
        await note.save()
        res.status(200).json({message:"Tag added!"})
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err);
  }
})

router.route("/students/:studentId/notes/:noteId/tags/:tagId")
//pentru afisarea unei anumite etichete a unei anumite notite a unui anume student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        const tags = await note.getTags({where:{id:req.params.tagId}})
        const tag = tags.shift();
        if(tag){
          res.status(200).json(tag)
        }else{
          res.status(404).json({"error":`The tag with the id ${req.params.tagId} was not found`})
        }
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
//PUT - pentru editarea unei etichete a unei anumite notite a unui anumit student
.put(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        const tags = await note.getTags({where:{id:req.params.tagId}})
        const tag = tags.shift();
        if(tag){
          await tag.update(req.body);
          res.status(200).json({message:"Tag updated!"})
        }else{
          res.status(404).json({"error":`The tag with the id ${req.params.tagId} was not found`})
        }
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
//DELETE - pentru stergerea unei anumite etichete a unei anumite notite a unui anumit student
.delete(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const notes = await student.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        const tags = await note.getTags({where:{id:req.params.tagId}})
        const tag = tags.shift();
        if(tag){
          await tag.destroy();
          res.status(200).json({message:"Tag deleted!"})
        }else{
          res.status(404).json({"error":`The tag with the id ${req.params.tagId} was not found`})
        }
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found`})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})

router.route("/students/:studentId/groups")
//GET - pentru afisarea tuturor grupurilor ale unui anumit student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const groups = await student.getGroups()
      if(groups){
        res.status(200).json(groups)
      }else{
        res.status(404).json({"error":"No groups were found"})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
//POST - pentru crearea unui grup de catre un student
.post(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
     const group = await Group.create(req.body)
     group.addStudent(student) // adaugarea studentului care a creat grupul in grup
     await student.save()
     res.status(200).json({"message":`Group created and student with id ${req.params.studentId} was added in it`})
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})

router.route("/students/:studentId/groups/:groupId")
// GET - afisarea unui anumit grup din care face parte un anumit student
.get(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const groups = await student.getGroups({where:{id:req.params.groupId}})
      const group = groups.shift()
      if(group){
        res.status(200).json(group)
      }else{
        res.status(404).json({"error":"No groups were found"})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
// POST - adaugarea unui anumit student intr-un anumit grup deja existent
.post(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const group = await Group.findByPk(req.params.groupId)
      if(group){
        group.addStudent(student);
        res.status(404).json({message:`The student with the id ${req.params.studentId} was added in the group with the id ${req.params.groupId}`})
      }else{
        res.status(404).json({"error":"No groups were found"})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
// PUT - editarea unui anumit grup din care face parte un anumit student
.put(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const groups = await student.getGroups({where:{id:req.params.groupId}})
      const group = groups.shift()
      if(group){
        await group.update(req.body)
        res.status(200).json({message:`The group with id ${req.params.groupId} was updated!`})
      }else{
        res.status(404).json({"error":"No groups were found"})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})
// DELETE - eliminarea unui student dintr-un anumit grup
.delete(async(req,res,next)=>{
  try{
    const student = await Student.findByPk(req.params.studentId);
    if(student){
      const groups = await student.getGroups({where:{id:req.params.groupId}})
      const group = groups.shift()
      if(group){
        group.removeStudent(student)
        await student.save()
        res.status(200).json({message:`The student with id ${req.params.studentId} was removed from the group with the id ${req.params.groupId}!`})
      }else{
        res.status(404).json({"error":"No groups were found"})
      }
    }else{
      res.status(404).json({"error":`The student with the id ${req.params.studentId} was not found`})
    }
  }catch(err){
    next(err)
  }
})

router.route("/groups/:groupId/notes/:noteId")
// GET - vizualizarea unei anumite notite dintr-un anumit grup
.get(async(req,res,next)=>{
  try{
    const group = await Group.findByPk(req.params.groupId);
    if(group){
      const notes = await group.getNotes({where:{id:req.params.noteId}})
      const note = notes.shift()
      if(note){
        res.status(200).json(note)
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found!`})
      }
    }else{
      res.status(404).json({"error":`The group with the id ${req.params.groupId} was not found!`})
    }
  }catch(err){
    next(err)
  }
})
// POST - adaugarea unei anumite notite existente intr-un anumit grup
.post(async(req,res,next)=>{
  try{
    const group = await Group.findByPk(req.params.groupId);
    if(group){
      const note = await Note.findByPk(req.params.noteId)
      if(note){
        group.addNote(note);
        await group.save();
        res.status(200).json({message: `The note with the id ${req.params.noteId} was added in the group with the id ${req.params.groupId}`})
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found!`})
      }
    }else{
      res.status(404).json({"error":`The group with the id ${req.params.groupId} was not found!`})
    }
  }catch(err){
    next(err)
  }
})
// DELETE - eliminarea unei anumite notite dintr-un anumit grup
.delete(async(req,res,next)=>{
  try{
    const group = await Group.findByPk(req.params.groupId);
    if(group){
      const note = await Note.findByPk(req.params.noteId)
      if(note){
        group.removeNote(note);
        await group.save()
        res.status(200).json({message: `The note with the id ${req.params.noteId} was eliminated from the group with the id ${req.params.groupId}`})
      }else{
        res.status(404).json({"error":`The note with the id ${req.params.noteId} was not found!`})
      }
    }else{
      res.status(404).json({"error":`The group with the id ${req.params.groupId} was not found!`})
    }
  }catch(err){
    next(err)
  }
})

module.exports = router;
