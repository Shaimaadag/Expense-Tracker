const express= require("express");
require("dotenv").config();

const app= express();

app.use(express.json());

const cors = require("cors");
app.use(cors());

const {Pool}= require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get("/api/expenses", async (req, res) => {
    try {
    const result= await pool.query("SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date FROM expenses");
    res.json(result.rows);
    } catch (error) {
        console.log(error);
    }
});

app.get("/api/expenses/:id", async (req, res) => {
    try {
        const result= await pool.query("SELECT id, title, amount::float8,category, to_char(date, 'YYYY-MM-DD')AS date FROM expenses WHERE Id=$1",[req.params.id]);
        if(result.rows.length==0){
           return res.status(404).json({message: "Not Found"});
        }
        res.json(result.rows[0]);

    } catch (error) {
       console.log(error);
    }
});

const allowedCategories= ["Food", "Bills", "Transport", "Entertainment", "Other"];
app.post("/api/expenses/", async (req, res) => {
    try {
        if(!req.body.title || !req.body.amount || !req.body.category || !req.body.date){
           return res.status(400).json({message: "All fields are required"});
        }
        
        if(Number.isNaN(Number(req.body.amount)) || req.body.amount <= 0){
          return  res.status(400).json({message: "amount must be a number and greater than 0"});
        }

        if(!allowedCategories.includes(req.body.category)){
           return res.status(400).json({message: "Category must be one of: Bills, Transport, Food, Entertainment, Other"});
        }

        const result= await pool.query("INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date", 
            [req.body.title, req.body.amount, req.body.category, req.body.date]);
       
            res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log(error);
    }
});

app.put("/api/expenses/:id", async (req, res) => {
    try {
        if(!req.body.title ||!req.body.amount==undefined || !req.body.category || !req.body.date){
            return res.status(400).json({message: "All fields is required"});
        }

        if(Number.isNaN(Number(req.body.amount)) || req.body.amount <= 0){
           return res.status(400).json({message: "amount must be a number and greater than 0"});
        }

        if(!allowedCategories.includes(req.body.category)){
           return res.status(400).json({message: "Category must be one of: Bills, Transport, Food, Entertainment, Other"});
        }
        
        const result= await pool.query("Update expenses SET title=$1, amount=$2, category=$3, date=$4 WHERE Id= $5 RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date", [req.body.title, req.body.amount, req.body.category, req.body.date, req.params.id]);
        if(result.rows.length==0){
           return res.status(404).json({message: "Not Found"});
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error); 
    }   
});

app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const result= await pool.query("DELETE FROM expenses WHERE Id= $1", [req.params.id]);
        if(result.rowCount==0){
            return res.status(404).json({message: "Not Found"});
        }
        res.status(200).json({message: "Successfully Deleted"});
    } catch (error) {
        console.log(error);  
    }
});

// app.listen(...)
// تستخدمها حتى نخلي الـAPI تستقبل Requests.
app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});


