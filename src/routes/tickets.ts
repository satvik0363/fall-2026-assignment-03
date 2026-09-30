import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import type { Request, Response, NextFunction } from 'express';
import {getAllTickets, getTicketById, createTicket, updateTicketStatus } from '../dal/tickets.js';
import { getUserById} from '../dal/users.js';
import {insertTimeLog, getTotalHoursForTicket} from '../dal/timeLogs.js';
const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
const validStatus = ['TODO', 'IN_PROGRESS', 'DONE'];
function parseId(value: string): number | null {
    if (!/^\d+$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}

async function getTicketsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const {limit, offset, status} = req.query;
        const options: {limit?: number; offset?: number; status?: string} = {};
        if (limit !== undefined) {
            if (typeof limit !== 'string' || !/^\d+$/.test(limit) || Number(limit) < 1) {
                res.status(400).json({error: 'Invalid limit amount'});
                return;
            }
            options.limit = Number(limit);
        }
        if (offset !== undefined) {
            if (typeof offset !== 'string' || !/^\d+$/.test(offset)) {
                res.status(400).json({error: 'Invalid offset amount'});
                return;
            }
            options.offset = Number(offset);
        }
        if (status !== undefined) {
            if (typeof status !== 'string' || !validStatus.includes(status)) {
                res.status(400).json({error: "Invalid status"});
                return;
            }
            options.status = status;
        }

        const tickets = await getAllTickets(options);
        res.status(200).json(tickets);
    } 
    catch (error) {
    res.status(500).json({error: "Could not get tickets"});
    }
}
router.get('/', getTicketsHandler);

// GET /tickets/:id
async function getTicketHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseId(req.params.id);
        if (id === null) {
            res.status(400).json({error: 'Invalid ticket ID'});
            return;
        }
        const ticket = await getTicketById(id);
        if (!ticket) {
            res.status(404).json({ error: 'Ticket does not exist' });
            return;
        }
        res.status(200).json(ticket);
    } 
    catch (error) {
    res.status(500).json({error: "Could not get ticket"});
    }
}
router.get("/:id", getTicketHandler);

// POST /tickets
async function createTicketHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const {title, description} = req.body ?? {};
        if (typeof title !== 'string' || title.length === 0) {
            res.status(400).json({error: 'Need a title'});
            return;
        }
        if (typeof description !== 'string') {
            res.status(400).json({error: 'Need a description' });
            return;
        }
        const creatorId: number = res.locals.userId;
        const creator = await getUserById(creatorId);
        if (!creator) {
            res.status(401).json({error: 'COUld not find user'});
            return;
        }
        const ticket = await createTicket({title: title, description, creator_id: creatorId});
        res.status(201).json(ticket);
    } 
    catch (error) {
        res.status(500).json({error: "Could not create ticket"});
    }
}
router.post("/", authMiddleware, createTicketHandler);

// PATCH /tickets/:id/status
async function updateStatusHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseId(req.params.id);
        if (id === null) {
        res.status(400).json({error: "Invalid number"});
        return;
        }
        const {status} = req.body ?? {};
        if (typeof status !== 'string' || !validStatus.includes(status)) {
            res.status(400).json({error: "Invalid status"});
            return;
        }
        const ticket = await updateTicketStatus(id, status);
        if (!ticket) {
            res.status(404).json({error: "COuld not find ticket"});
            return;
        }
        res.status(200).json(ticket);
    } 
    catch (error) {
        res.status(500).json({error: "Could not change ticket status"});
    }
}
router.patch('/:id/status', authMiddleware, updateStatusHandler);
// TODO: Student implementation - Part 2: Time Log Routes
// POST /:id/time
router.post('/:id/time', authMiddleware, async(req, res, next) => {
    try {
        const ticketId = Number(req.params.id);
        const {hours} = req.body;
        const userId = res.locals.userId;
        if (isNaN(ticketId)) {
            return res.status(400).json({error: "Ticket ID is not valid"});
        }
        if (typeof hours !== 'number') {
            return res.status(400).json({error: "Hours has to be a number"});
        }
        const timelogId = await insertTimeLog(ticketId, userId, hours);
        res.status(201).json({id: timelogId, ticket_id: ticketId, user_id: userId, hours: hours});
    }
    catch (error) {
        res.status(500).json({error: "Time log did get created"});
    }
});
// GET /tickets/:id/time
router.get('/:id/time', async(req, res, next) => {
    try {
        const ticketId = Number(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).json({error: "Ticket ID is invalid"});
        }
        const totalHours = await getTotalHoursForTicket(ticketId);
        res.status(200).json({ticket_id: ticketId, total_hours: totalHours});
    }
    catch (error) {
        res.status(500).json({error: "Could not get time logs"});
    }
});

export default router;
