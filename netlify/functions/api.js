import 'dotenv/config'
import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import serverless from "serverless-http";

const api = express();

api.use(cors())
api.use(bodyParser.json())

mongoose.connect(process.env.DATABASE_URL)

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})
const Author = mongoose.model('Author', authorSchema)

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    publishDate: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

const Book = mongoose.model('Book', bookSchema)

const userSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        required: true
    }
})

const User = mongoose.model('User', userSchema)

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

router.get('/book', async (req, res) => {
    const book = await Book.find({});
    res.json(book)
})

router.get('/book/:id', async (req, res) => {
    const book = await Book.findById(req.params.id).populate("author")
    res.json(book)
})

router.delete('/book/:id', async (req, res) => {
    Book.deleteOne({"_id": req.params.id})
    .then(() => {
        res.sendStatus(200)
    })
    .catch(error => {
        res.sendStatus(500)
    })
})

router.put('/book/:id', async (req, res) => {

    Book.updateOne({"_id": req.params.id}, {title: req.body.title, publishDate: parseInt(req.body.publishDate)})
    .then(() => {
        res.sendStatus(200)
    })
    .catch(error => {
        res.sendStatus(500)
    })
})

router.post('/book/new', async (req, res) => {
    if( await Author.count({"name": req.body.author}) === 0 ) {
        const newAuthor = new Author({name: req.body.author})
        newAuthor.save()
        .then(() => {
            addBook(req.body.author)
        })
    } else{
        addBook(req.body.author)
    }

    async function addBook(reqAuthor) {
        const author = await Author.findOne({"name": reqAuthor})
        const book = new Book({
            title: req.body.title,
            author: author,
            publishDate: parseInt(req.body.publishDate)
        })
        book.save()
        .then(() => {
            console.log('New book added');
            res.sendStatus(200)
        })
        .catch(error => {
            console.error(error)
        })
    }
})

router.get('/author', async (req, res) => {
    const author = await Author.find({});
    res.json(author)
})
router.get('/author/:id', async (req, res) => {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({"author": req.params.id})
    const result = { author, books }
    res.json(result)
})

router.post('/user/login', async (req, res) => {
    const now = new Date()
    if( await User.count({"userEmail": req.body.email}) === 0 ) {
        const newUser = new User({userEmail: req.body.email, lastLogin: now})
        newUser.save()
        .then(() => {
            res.sendStatus(200)
        })
    } else{
        await User.findOneAndUpdate({"userEmail": req.body.email}, {lastLogin: now})
        res.sendStatus(200)
    }
})

api.use("/api/", router);

export const handler = serverless(api);