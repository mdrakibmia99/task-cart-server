const express = require('express');
var cors = require('cors')
require("dotenv").config();
const multer = require('multer');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());


// mongodb uri 
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });


async function run() {
  try {
    await client.connect();
    const db = await client.db('task-cart');
    const tasksCollection = db.collection('attachments');

    // get all attachment
    app.get('/tasks', async (req, res) => {
      const tasks = await tasksCollection.find({}).toArray();
      console.log(tasks)
      res.json(tasks);

    });


    // Upload endpoint
    app.post('/upload', upload.array('attachments'), async (req, res) => {
      try {
        const files = req.files.map((file) => ({
          filename: file.filename,
          path: file.path,
        }));
        const result = await tasksCollection.insertOne({files});
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } finally {
 
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is Running-->')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
