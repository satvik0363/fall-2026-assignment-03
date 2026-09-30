import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
    // TODO: Student implementation - Part 1: Integration Testing
    // Test user creation (POST /users)
    
    // Test ticket creation (POST /tickets)
    
    // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
  it('Should return 401 when X-user-ID is missing', async () => {
    const response = await request(app)
    .post('/tickets')
    .send({title: 'Invalid Ticket', description: 'Missing X-User-ID'});
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 401   X-user-ID is ivnalid', async () => {
    const response = await request(app)
      .post('/tickets')
      .set('X-user-ID', '999999')
      .send({title: 'Invalid ticket', description: 'Invalid X-User-ID'});
    expect(response.status).toBe(401);
  }); 

    // Test 404 responses for non-existent users and tickets
  it('Should return 404 non-existent user', async () => {
    const response = await request(app).get('/users/999999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('Should return 404  non-existent ticket', async () => {
    const response = await request(app).get('/tickets/999999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

    // Test pagination and filtering on GET /tickets
  it('Should limit and offset pagination on GET /tickets', async () => {
    const response = await request(app)
    .get('/tickets')
    .query({limit: '1', offset: '0'});
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(1);
  });
  it('Should filter tickets by valid status', async () => {
    const response = await request(app)
    .get('/tickets')
    .query({status: 'TODO'});
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it('Should give error 400  for invalid status', async () => {
    const response = await request(app)
    .get('/tickets')
    .query({status: 'INVALID_STATUS'});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});