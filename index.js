const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.port || 3000;

// Middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Job Portal API is running!');
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hvhc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
    // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // jobs relative api 
        const jobsCollection = client.db('JobPortals').collection('jobs'); 
        const categoriesCollection = client.db('JobPortals').collection('categories');
        const usersCollection = client.db('JobPortals').collection('users');
        const statsCollection = client.db('JobPortals').collection('stats');
        const companysCollection = client.db('JobPortals').collection('companys');
        const jobApplicationCollection = client.db('JobPortals').collection('jobApplications');

        // get all jobs
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/jobs/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })


        app.post('/jobs', async(req, res) => {
            const job = req.body;
            const result = await jobsCollection.insertOne(job);
            res.send(result);
        })

        app.get('/jobs', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { hr_email: email };
            }
            const cursor = jobsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })



        app.post('/jobApplications', async(req, res) => {
            const application = req.body;
            const result = await jobApplicationCollection.insertOne(application);
            res.send(result);
        })

        app.get('/jobApplication', async(req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const result = await jobApplicationCollection.find(query).toArray();
            for (const application of result) {
                const query1 = { _id: new ObjectId(application.job_id) }
                const job = await jobsCollection.findOne(query1);
                if (job) {
                    application.title = job.title;
                    application.location = job.location;
                    application.company = job.company;
                    application.company_logo = job.company_logo;
                    application.jobType = job.jobType;
                }
            }
            res.send(result);
        })


        app.delete('/jobApplications/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await jobApplicationCollection.deleteOne({ _id: new ObjectId(id) });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });




        // get stats data 
        app.get('/stats', async (req, res) => {
            const cursor = statsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get companys data
        app.get('/companys', async (req, res) => {
            const cursor = companysCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });


    // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

