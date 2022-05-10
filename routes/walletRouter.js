import { Router } from "express";

import {Main, Transactions} from "./../controllers/walletController.js";

const walletRouter = Router();

walletRouter.get('/main', Main);
walletRouter.post('/transactions', Transactions)

export default walletRouter;