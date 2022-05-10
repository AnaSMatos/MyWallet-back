import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from "./../db.js"

export async function SignIn(req, res){
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    const name = user.name;
    if(user && bcrypt.compareSync(password, user.password)) {
        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id, token
        })
        res.send({token, name})
    } else {
        res.status(422).send("Usuário ou senha incorretos")
    }
}

export async function SignUp(req, res){
    const {name, email, password, confirmPassword} = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    try{
        await db.collection('users').insertOne({
            name, email, password: passwordHash
        })
        res.sendStatus(201);
    }catch{
        res.send("deu TRETA!")
    }
}