import Joi from "joi";
import db from "./../db.js";

export async function Validation(req, res, next){
    const signupSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.ref('password')
    }) 

    const validation = signupSchema.validate(req.body)
    if(validation.error){
        return res.status(422).send("Preencha os dados corretamente")
    }
    const checkAccount = await db.collection('users').findOne({
        email: email
    })
    if(checkAccount){
        return res.status(409).send("Email já cadastrado");
    }
    
    next();
}