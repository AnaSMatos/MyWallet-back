import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {MongoClient} from "mongodb"
import Joi from "joi"
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

dotenv.config();

const app = express()
app.use(express.json())
app.use(cors())

let db;

const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(()=>{
    db = mongoClient.db(process.env.BANCO);
    console.log("conectado ao banco")
})

promise.catch(e=>console.log("erro ao conectar"))

//JOI
const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.ref('password')
}) 

//POST SIGN UP - OK
app.post("/sign-up", async (req, res) => {
    const {name, email, password, confirmPassword} = req.body;
    const validation = signupSchema.validate(req.body)
    const passwordHash = bcrypt.hashSync(password, 10);
    try{
        const checkAccount = await db.collection('users').findOne({
            email: email
        })
        if(checkAccount){
            return res.status(409).send("Email já cadastrado");
        }
        if(validation.error){
            return res.status(422).send("Preencha os dados corretamente")
        }

        await db.collection('users').insertOne({
            name, email, password: passwordHash
        })
        res.sendStatus(201);


    }catch{
        res.send("deu TRETA!")
    }
})

//POST SIGN IN

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    if(user && bcrypt.compareSync(password, user.password)) {
        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id, token
        })
        res.send(token)
    } else {
        res.status(422).send("Usuário ou senha incorretos")
    }
});

app.get("/main", async (req, res) => {
    const {authorization} = req.headers;
    const token = authorization.substring("Bearer ".length)
    try{
        const online = await db.collection('sessions').findOne({token});
        if(!online){
            return res.sendStatus(498);
        }
        const data = await db.collection('data').find({userId: online.userId}).toArray();
        res.send(data);
    }catch{
        res.sendStatus(422)
    }
})

app.post("/transactions", async(req, res) => {
    const {authorization} = req.headers;
    const token = authorization.substring("Bearer ".length)
    const today = new Date();
    const date = `${today.getDate()}/${today.getMonth()+1}`
    try{
        const online = await db.collection('sessions').findOne({token});
        if(!online){
            return res.sendStatus(498);
        }
        await db.collection('data').insertOne({
            ...req.body,
            userId: online.userId,
            date
            })

        res.status("Sucesso!").status(201)
    }catch{
        res.sendStatus(422)
    }
})

app.listen(process.env.PORT, () => {
    console.log(`conectado na porta ${process.env.PORT}`)
})

