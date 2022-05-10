import db from "./../db.js";

export async function Main(req, res){
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
}

export async function Transactions(req,res){
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
}