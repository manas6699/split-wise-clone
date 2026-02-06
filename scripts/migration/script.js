const { MongoClient } = require('mongodb');
const mysql = require('mysql2');

async function migrate() {
    const mongoClient = await MongoClient.connect('mongodb+srv://manasbaroi6699:WiFoEb5HgBsKVwQe@cluster0.mk3lh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    const mdb = mongoClient.db('freshdb'); 
    
    const sqlConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'manas',
        database: 'crm'
    }).promise();

    console.log("Connected. Starting migration...");

    try {
        const cursor = mdb.collection('assigns').find({});
        let count = 0;

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            count++;
            
            // Extracting from your specific sample schema
            const details = doc.lead_details || {};
            
            // Handle MongoDB extended JSON formats ($oid and $date)
            const mongo_id = doc._id?.$oid || doc._id.toString();
            const created_at = doc.createdAt?.$date || doc.createdAt;

            const query = `
                INSERT INTO prodDB_assigns 
                (mongo_id, lead_id, assignee_name, status, lead_name, lead_phone, lead_status, subdisposition, dumb_id, assign_mode, createdAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
                ON DUPLICATE KEY UPDATE status = VALUES(status);
            `;

            await sqlConnection.execute(query, [
                mongo_id,
                doc.lead_id || null,
                doc.assignee_name || null,
                doc.status || null,
                details.name || null,
                details.phone || null,
                details.lead_status || null,
                details.subdisposition || null,
                doc.dumb_id || null,
                doc.assign_mode || null,
                created_at ? new Date(created_at) : null
            ]);
        }
        
        console.log(`✅ Migration successful! Processed ${count} documents.`);
    } catch (err) {
        console.error("❌ Migration error:", err);
    } finally {
        await mongoClient.close();
        await sqlConnection.end();
    }
}

migrate();