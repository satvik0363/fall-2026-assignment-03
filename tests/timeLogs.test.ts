import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    // Log hours for a ticket (POST /tickets/:id/time)
    it('should log different tiemes and get total hours from a ticket', async () => {
      const user = await request(app).post('/users').send({name: 'Test User', email: 'test-@example.com'});
      expect(user.status).toBe(201);
      const userID = user.body.id;
      const ticket = await request(app)
      .post('/tickets')
      .set('X-user-ID', '1')
      .send({title: 'Time Log Total Test', description: 'Testing total hours'});
      if (ticket.status !== 201) {
      console.log('Ticket creation error:', ticket.status, ticket.body);
      }
      
      expect(ticket.status).toBe(201);
      const ticketId = ticket.body.id;
    // Fetch total hours for a ticket (GET /tickets/:id/time)
      const initialTotal = await request(app).get(`/tickets/${ticketId}/time`);
      expect(initialTotal.status).toBe(200);
      expect(initialTotal.body).toEqual({ticket_id: ticketId, total_hours: 0});
    // Verify aggregation math
      const log1 = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-user-ID', '1')
      .send({hours: 2.5});
      expect(log1.status).toBe(201);
      expect(log1.body).toHaveProperty('id');
      const log2 = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-user-ID', '1')
      .send({ hours: 3.5 });
      expect(log2.status).toBe(201);
      const finalTotal = await request(app).get(`/tickets/${ticketId}/time`);
      expect(finalTotal.status).toBe(200);
      expect(finalTotal.body).toEqual({
      ticket_id: ticketId,
      total_hours: 6,
    });
  });
  it('should reject time log creation when auth header is missing', async () => {
    const response = await request(app)
    .post('/tickets/1/time')
    .send({ hours: 2 });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
  it('should return 400 Bad Request for invalid hours input', async () => {
    const response = await request(app)
    .post('/tickets/1/time')
    .set('X-user-ID', '1')
    .send({ hours: 'invalid_hours' });
    expect(response.status).toBe(400);
  });
});