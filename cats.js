import 'dotenv/config'
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dogs from "./data/dogs.js";
import mongoose from "mongoose";

const app = express()

app.use(cors())
app.use(bodyParser.json())

mongoose.connect(process.env.DATABASE_URL)
const catSchema = new mongoose.Schema({ name: String, age:Number })
const Cat = mongoose.model('Cat', catSchema);

app.get('/', (req, res) => {
        res.json({
            message: 'Welcome to MEVN'
        })
})

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`listening on port: ${port}`);
})

app.get('/dogs', (req, res) => {
    res.json(dogs)
})

app.get('/dogs/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const dog = dogs.find(dog => (
        dog.id === id
    ))
    res.json(dog)
})

app.get('/cat-facts', (req, res) => {
    fetch('https://cat-fact.herokuapp.com/facts')
    .then((response) => response.json())
    .then(data => {
        res.json(data);
    })
})

app.get('/cats', async (req, res) => {
    const cats= await Cat.find({});
    res.json(cats)
})

app.post('/cats/add', (req, res) => {
    const cat = req.body
    const kitty = new Cat({name: cat.name, age: parseInt(cat.age)})
    kitty.save()
    .then(()=>{
        console.log(`New cat ${cat.name} age: ${cat.age} was added`);
        res.sendStatus(200)
    })
    .catch(error => {
        console.error(error)
    })
})
