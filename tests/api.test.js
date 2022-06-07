'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/database/schemas');
const expect = require('chai').expect;

const driverName = "driverA";
const riderName = "riderA";
const driverVehicle = "SWR2022"
const logger = require('../src/utils/logger');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('Rides', () => {
        let rideId;
        it('should return 0 ride records', (done) => {
            request(app)
                .get('/rides')
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body.error_code).to.be.equal('RIDES_NOT_FOUND_ERROR');
                    done();
                });
        });

        it('should NOT create a ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 181.00,
                    'end_lat': 90.00,
                    'end_long': 90.00,
                    'rider_name': riderName,
                    'driver_name': driverName,
                    'driver_vehicle': driverVehicle
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('VALIDATION_ERROR');
                    done();
                });
        });
        it('should NOT create a ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 90.00,
                    'end_lat': 92.00,
                    'end_long': 90.00,
                    'rider_name': riderName,
                    'driver_name': driverName,
                    'driver_vehicle': driverVehicle
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('VALIDATION_ERROR');
                    done();
                });
        });
        it('should NOT create a ride due to invalid riderName', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 90.00,
                    'end_lat': 90.00,
                    'end_long': 90.00,
                    'rider_name': '',
                    'driver_name': driverName,
                    'driver_vehicle': driverVehicle
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('VALIDATION_ERROR');
                    done();
                });
        });
        it('should NOT create a ride due to invalid driverName', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 90.00,
                    'end_lat': 90.00,
                    'end_long': 90.00,
                    'rider_name': riderName,
                    'driver_name': '',
                    'driver_vehicle': driverVehicle
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('VALIDATION_ERROR');
                    done();
                });
        });
        it('should NOT create a ride due to invalid driver vehicle', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 90.00,
                    'end_lat': 90.00,
                    'end_long': 90.00,
                    'rider_name': riderName,
                    'driver_name': driverName,
                    'driver_vehicle': ''
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('VALIDATION_ERROR');
                    done();
                });
        });
        it('should create a ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 90.00,
                    'start_long': 90.00,
                    'end_lat': 90.00,
                    'end_long': 90.00,
                    'rider_name': riderName,
                    'driver_name': driverName,
                    'driver_vehicle': driverVehicle
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    rideId = res.body[0].rideID;
                    done();
                });
        });
        it('should return a list of ride', (done) => {
            request(app)
                .get('/rides')
                .query({
                    'page': 0,
                    'pageSize': 25
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).to.have.length(1);
                    done();
                });
        });
        it('should not return a list of ride', (done) => {
            request(app)
                .get('/rides')
                .query({
                    'page': 1,
                    'pageSize': 25
                })
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('RIDES_NOT_FOUND_ERROR');
                    done();
                });
        });
        it('should return a ride', (done) => {
            request(app)
                .get(`/rides/${rideId}`)
                .end((err, res) => {
                    if (err) logger.error(err);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body.driverVehicle).to.be.equal(driverVehicle);
                    done();
                });
        });
        it('should throw an error as ride does not exists', (done) => {
            request(app)
                .get(`/rides/100`)
                .end((err, res) => {
                    if (err) logger.error(err);
                    logger.info(res.body);
                    expect(res.statusCode).to.be.equal(200);
                    expect(res.body).include.all.keys('error_code', 'message');
                    expect(res.body.error_code).to.be.equal('RIDES_NOT_FOUND_ERROR');
                    done();
                });
        });
    });
});