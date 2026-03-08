const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs:15*60*1000, max:100 }));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB connection error:",err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/protected"));

// Root route for quick health check
app.get("/", (req,res)=>res.send("Secure Auth System Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log("Server running on port "+PORT));
