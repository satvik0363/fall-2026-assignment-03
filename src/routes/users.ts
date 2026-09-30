import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {authMiddleware} from '../middleware/auth.js'; 
import {getAllUsers, getUserById, createUser} from '../dal/users.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes  

// GET /users
router.get('/', async(req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    }
    catch(error) {
        res.status(500).json({error: "Could not get user"});
    }
});
// GET /users/:id
router.get('/:id', async (req, res) => {
    try {
        const userID = Number(req.params.id);
        if (isNaN(userID)) {
            return res.status(400).json({error: "User ID is not valid"});
        }
        const user = await getUserById(Number(req.params.id));
        if (!user) {
            return res.status(404).json({error: "Could not find user"});
        }
        res.status(200).json(user);
    }
    catch(error) {
        res.status(500).json({error: "Could not get user"});
    }

});
// POST /users
router.post('/', authMiddleware, async(req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        if (!name || !email) {
            return res.status(400).json({error: "Need name and email"});
        }
        const user = await createUser({name, email});
        res.status(201).json(user);
    }
    catch(error) {
        res.status(500).json({error: "User did not get created"});
    }
});

export default router;
