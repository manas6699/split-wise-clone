const { MongoClient } = require('mongodb');
const mysql = require('mysql2');

async function migrate() {
    const mongoClient = await MongoClient.connect('mongodb+srv://manasbaroi6699:WiFoEb5HgBsKVwQe@cluster0.mk3lh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    const mdb = mongoClient.db('freshdb'); 
    
    const sqlConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'test'
    }).promise();

    console.log("Connected. Starting migration...");

    try {
        const cursor = mdb.collection('assigns').find({});
        let count = 0;

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            count++;
            
            // Handle MongoDB $oid objects for IDs
            const mongo_id = doc._id?.$oid || doc._id.toString();
            
            // Critical Step: Convert the history array to a JSON string
            const historyData = doc.history ? JSON.stringify(doc.history) : null;

            const query = `
                INSERT INTO assigns_history_migration 
                (mongo_id, assignee_id, assignee_name, lead_id, dumb_id, history) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE history = VALUES(history);
            `;

            await sqlConnection.execute(query, [
                mongo_id,
                doc.assignee_id || null,
                doc.assignee_name || null,
                doc.lead_id || null,
                doc.dumb_id || null,
                historyData // Passed as stringified JSON
            ]);
        }
        
        console.log(`✅ Success! Migrated ${count} documents including history.`);
    } catch (err) {
        console.error("❌ Migration error:", err);
    } finally {
        await mongoClient.close();
        await sqlConnection.end();
    }
}

migrate();