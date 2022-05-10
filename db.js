import dotenv from "dotenv"
import {MongoClient} from "mongodb"

dotenv.config();

let db;

const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(()=>{
    db = mongoClient.db(process.env.BANCO);
    console.log("conectado ao banco")
})
promise.catch(e=>console.log("erro ao conectar"))

export default db;