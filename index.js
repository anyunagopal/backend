const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const port = 8800;
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

const url = 'mongodb+srv://anyunagopal:OurPczAJ2i7FlcHe@cluster0.u5sj8gl.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully');
        const db = client.db('demo');
        const collection = db.collection('student_details');

        app.post('/create', async (req, res) => {
            try {
                const schema = Joi.object({
                    full_name: Joi.string().required(),
                    gender: Joi.string().valid('female', 'male', 'other').required(),
                    dob: Joi.string().required(),
                    division: Joi.string().required(),
                    class: Joi.string().required(),
                });

                const { error } = schema.validate(req.body);

                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }

                const existingStudent = await collection.findOne({ full_name: req.body.full_name });

                if (existingStudent) {
                    return res.status(409).json({ error: 'Student already exists' });
                }

                const newStudent = req.body;
                await collection.insertOne(newStudent);
                res.status(201).json({ message: 'Student created successfully' });
            } catch (error) {
                console.error('Error creating student:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.get('/student', async (req, res) => {
            const documents = await collection.find({}).toArray();
            res.send(documents);
        });

        app.listen(port, () => console.log("Listening to port " + port));
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

run().catch(console.dir);