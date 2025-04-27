const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const app = express()
app.use(cors())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: 'inventory'
})

app.get("/goods"(req,res){
    const sql = "SELECT * FROM goods"
    db.query(sql, (err, data)=>{
        if(err) return res.json('Error')
            return res.json(data)
    })
})

app.get('/api',(req,res)=>{
    res.json({message:'hello from the server. this is from the backend'})
})

app.listen(8081,()=>{
    console.log('Listening...')
})