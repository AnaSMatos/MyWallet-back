import { Router } from "express";

import {SignIn, SignUp} from "./../controllers/authController.js";
import {Validation} from "./../middleawares/authMid.js"

const authRouter = Router();

authRouter.post('/sign-in', SignIn);
authRouter.post('/sign-up', Validation, SignUp)

export default authRouter;