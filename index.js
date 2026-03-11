require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

/* -------- MongoDB Connection -------- */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

/* -------- Patient Schema -------- */

const patientSchema = new mongoose.Schema({

  fullName: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phoneNumber: { type: String, required: true },

  age: { type: Number, required: true, min: 1 },

  gender: { type: String, enum: ["Male","Female","Other"], required: true },

  disease: { type: String, required: true },

  doctorAssigned: { type: String, required: true },

  admissionDate: { type: Date, required: true },

  roomNumber: { type: String, required: true },

  patientType: { type: String, enum: ["Inpatient","Outpatient"], required: true },

  status: { type: String, enum: ["Admitted","Discharged"], default: "Admitted" }

},{timestamps:true});

const Patient = mongoose.model("Patient", patientSchema);

/* -------- CREATE -------- */

app.post("/patients", async (req,res)=>{
  try{
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  }catch(error){
    res.status(400).json({message:error.message});
  }
});

/* -------- GET ALL -------- */

app.get("/patients", async (req,res)=>{
  try{
    const patients = await Patient.find();
    res.status(200).json(patients);
  }catch(error){
    res.status(500).json({message:error.message});
  }
});

/* -------- GET BY ID -------- */

app.get("/patients/:id", async (req,res)=>{
  try{
    const patient = await Patient.findById(req.params.id);

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json(patient);

  }catch(error){
    res.status(500).json({message:error.message});
  }
});

/* -------- UPDATE -------- */

app.put("/patients/:id", async (req,res)=>{
  try{
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true,runValidators:true}
    );

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json(patient);

  }catch(error){
    res.status(400).json({message:error.message});
  }
});

/* -------- DELETE -------- */

app.delete("/patients/:id", async (req,res)=>{
  try{
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if(!patient){
      return res.status(404).json({message:"Patient not found"});
    }

    res.status(200).json({message:"Deleted successfully"});

  }catch(error){
    res.status(500).json({message:error.message});
  }
});

/* -------- SEARCH -------- */

app.get("/patients/search", async (req,res)=>{
  try{
    const {name,disease} = req.query;

    let query = {};

    if(name){
      query.fullName = {$regex:name,$options:"i"};
    }

    if(disease){
      query.disease = {$regex:disease,$options:"i"};
    }

    const patients = await Patient.find(query);

    res.status(200).json(patients);

  }catch(error){
    res.status(500).json({message:error.message});
  }
});

/* -------- Server -------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});