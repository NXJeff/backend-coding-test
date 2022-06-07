'use strict';

/**
 * Initial script for database: create table Rides
 * @name create-db-script
 * @function
 * @param {Database} db - current database instance
 * @returns  {Database} db - current database instance
 */
module.exports = (db) => {
    const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

    db.run(createRideTableSchema);

    return db;
};
