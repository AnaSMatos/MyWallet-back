import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {MongoClient} from "mongodb"
import Joi from "joi"
import bcrypt from 'bcrypt';

dotenv.config();
const port = 5000;

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

//POST SIGN UP
app.post("/sign-up", async (req, res) => {
    const {name, email, password, confirmPassword} = req.body;
    const validation = signupSchema.validate(req.body)
    const passwordHash = bcrypt.hashSync(password, 10);
    try{
        const checkAccount = await db.collection('users').findOne({
            email: email
        })
        if(checkAccount){
            return res.send("Email já cadastrado").status(409);
        }
        if(validation.error){
            return res.send("Preencha os dados corretamente").status(422)
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
        res.send("login efetuado com sucesso").status(200)
    } else {
        res.send("usuário ou senha incorretos").status(404)
    }
});

app.listen(port, () => {
    console.log(`conectado na porta ${port}`)
})

//POST ENTRADA
//POST SAIDA