import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('DevPulse Agent API Tests', () => {

  // Test 1: Fetch Incidents Endpoint
  test('GET /api/v1/incidents should return 200 and success status', async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/incidents`);
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data), 'Data should be an array of incidents');
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        assert.fail(`Server is not running on ${BASE_URL}. Start 'node server.js' before running tests.`);
      }
      throw err;
    }
  });

  // Test 2: Crash Log Ingestion Payload Validation
  test('POST /api/v1/logs/crash should reject empty payloads with 400', async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/logs/crash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Sending empty payload
      });

      const data = await response.json();

      assert.equal(response.status, 400);
      assert.equal(data.success, false);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        assert.fail(`Server is not running on ${BASE_URL}. Start 'node server.js' before running tests.`);
      }
      throw err;
    }
  });

  // Test 3: Valid Ingestion Handshake
  test('POST /api/v1/logs/crash should accept valid crash logs with 202', async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/logs/crash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: 'test-runner-service',
          environment: 'testing',
          raw_log: 'Error: Automated integration test log entry'
        })
      });

      const data = await response.json();

      assert.equal(response.status, 202);
      assert.equal(data.success, true);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        assert.fail(`Server is not running on ${BASE_URL}. Start 'node server.js' before running tests.`);
      }
      throw err;
    }
  });

});