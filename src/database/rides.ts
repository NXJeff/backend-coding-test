import { Database, Statement } from 'sqlite3';
import IPageable from '../models/pageable.model';
import IRide from '../models/ride.model';

export default class RidesRepository {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Create ride records
     * @param ride ride record to be created
     * @returns created ride record 
     */
    create(ride: IRide): Promise<any> {
        const db = this.db;
        const values = [
            ride.startLat,
            ride.startLong,
            ride.endLat,
            ride.endLong,
            ride.riderName,
            ride.driverName,
            ride.driverVehicle
        ];
        return new Promise(async (resolve, reject) => {
            this.db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
                values, function (err: Error) {
                    if (err) {
                        reject(err);
                    }
                    db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err: Error, row: any[]) {
                        if (err) {
                            reject(err);
                        }
                        resolve(row);
                    })
                });
        });
    }

    /**
     *  Get a list of rides by pagination
     * @param pageable - page details
     * @returns - a list of rides of specific page
     */
    getAll(pageable: IPageable): Promise<any> {
        const page = pageable.page || 0;
        const pageSize = pageable.pageSize || 10;
        const offset = page * pageSize
        const query = `SELECT * FROM Rides LIMIT ${pageSize} OFFSET ${offset}`;

        return new Promise((resolve, reject) => {
            this.db.all(query, function (err: Error, rows: any[]) {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    /**
     * Get a specific ride by its ID
     * @param {number} id - Ride ID
     * @returns - a ride that located by Ride ID
     */
    getById(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM Rides WHERE rideID = ?', id, function (err: Error, row: any) {
                if (err) {
                    reject(err);
                }
                resolve(row);
            })
        })
    }
}
