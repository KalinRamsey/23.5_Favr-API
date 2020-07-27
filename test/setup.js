require('dotenv').config()

process.env.TZ = "UTC"
process.env.NODE_ENV = "test"
process.env.JTW_SECRET = "test-jwt-secret"
process.env.JWT_EXPIRY = "3m"

process.env.TEST_DB_URL = process.env.TEST_DB_URL
  || "postgresql://dunder_mifflin@localhost/favr-app-test"

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;