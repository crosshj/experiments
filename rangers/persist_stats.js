const MongoClient = require('mongodb').MongoClient;
const mostUsed = require('./most_used');

const url = require('./.secret.json').mongoUrl;
const dbName = 'rangers';

function doMongo(operation, callback){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        if(err){
            return callback(err);
        }
        const db = client.db(dbName);
        const pvp = db.collection('pvp');
        operation(pvp, callback);
        //client.close();
    });
}

function readPvp(callback, query = {}){
    const op = (collection, cb) => {
        collection.find(query).toArray(cb);
    };
    doMongo(op, callback);
}

function writePvp(callback, records = []){
    const op = (collection, cb) => {
        const readCb = (readErr, readData) => {

            const MS_PER_MINUTE = 60000;
            const sixtyMinutesAgo = new Date( Date.now() - 60 * MS_PER_MINUTE );
            const lastRecord = readData[readData.length - 1];
            const lastWriteDate = lastRecord
                ? new Date(lastRecord.createdDate)
                : undefined;

            const willWrite = !lastWriteDate || lastWriteDate <= sixtyMinutesAgo;
            const now = new Date(Date.now()).toLocaleString();

            // console.log({
            //     //now,
            //     las: lastWriteDate,
            //     fiv: sixtyMinutesAgo,
            //     willWrite
            // });

            if(!willWrite){
                return cb('Record already written recently', readData);
            }
            collection.insertMany(records.map(x => ({ createdDate: now, ...x })), cb);
        };
        // read first before writing
        readPvp(readCb, {});
    };
    doMongo(op, callback);
}

function pullAndSave(cb){
    // const records = [{ foo: 'bar' }];
    // writePvp((err, data) => {
    //     console.log({ err, data });
    //     readPvp((err, data) => console.log({ err, data }));
    // }, records);

    const opts = {
        dataOnly: true
    };
    const mostUsedCb = (err, data) => {
        if(err) return cb(err);
        writePvp((err, data) => {
            if(err) return cb(err, data)
            readPvp(cb);
        }, [{ top: data }]);
    };
    mostUsed(mostUsedCb, opts);
}

module.exports = {
    writePvp, readPvp, pullAndSave
};

if (!module.parent) {
    pullAndSave((err, data) => console.log({ err, data }))
}