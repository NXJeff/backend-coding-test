/**
 * This is an application providing endpoints for rides module
 *
 * @param {sqlite3.Database} db: Database instance of sqlite3 during initialization of the application
 * @module rides
 */
'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {

    /**
     * GET Health check endpoint:
     * To check if the server is in healthy state.
     * @name /health
     * @function
     * @memberof module:rides
     * @inner
     * @returns {any} String - 'Healthy: (with http 200) if server is at healthy state'
     */
    app.get('/health', (req, res) => res.send('Healthy'));

    /**
     * POST Ride Creation endpoint: To create a ride
     * @name post:/rides
     * @function
     * @memberof module:rides
     * @inner
     * @param {number} req.body.start_lat - Latitude on beginning of the ride
     * @param {number} req.body.start_long - Longitude on beginning of the ride
     * @param {number} req.body.end_lat - Latitude on end of the ride
     * @param {number} req.body.end_long - Longitude on end of the ride
     * @param {string} req.body.rider_name - The name of rider
     * @param {string} req.body.driver_name - The name of driver
     * @param {string} req.body.driver_vehicle - The registration name for driver's vehicle
     * @returns {any} rows - The ride record after saved to be send through response object
     * @returns {any} error - The error object contains error_code and message if error occurred.
     */
    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    /**
     * GET Rides: Return a list of rides
     * @name get:/rides
     * @function
     * @memberof module:rides
     * @inner
     * @param {number} page - the request page
     * @param {number} pageSize - the size of the page
     * @returns {any} rows - a list of rides
     * @returns {any} error - The error object contains error_code and message if error occurred.
     */
    app.get('/rides', (req, res) => {
        const page = req.query.page || 0;
        const pageSize = req.query.pageSize || 25;
        const offset = page * pageSize;
        const query = `SELECT * FROM Rides LIMIT ${pageSize} OFFSET ${offset}`;
        db.all(query, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    /**
     * GET Ride details: Return a specific of ride records by its id
     * @name get:/rides/:id
     * @function
     * @memberof module:rides
     * @inner
     * @name /rides/:id
     * @param {number} req.params.id - identifier of a specific ride to be filtered by
     * @returns {any} rows - a list of rides that filter by rideID
     * @returns {any} error - The error object contains error_code and message if error occurred.
     */
    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
