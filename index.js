const express = require('express');
var cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json());

console.log(process.env.UESER_NAME);

// mongodb application code

const uri = `mongodb+srv://${process.env.UESER_NAME}:${process.env.PASSWORD}@cluster0.bclqrjg.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        const blogsDataCollection = client.db('zymzoo').collection('blogs');
        const newsletterDataCollection = client.db('zymzoo').collection('news');
        const galleryDataCollection = client.db('zymzoo').collection('image');
        const trainerDataCollection = client.db('zymzoo').collection('trainer');
        const applyTrainerDataCollection = client.db('zymzoo').collection('applyTrainers');
        const userDataCollection = client.db('zymzoo').collection('users');
        const weeklySchedule = client.db('zymzoo').collection('schedule');
        const classesCollection = client.db('zymzoo').collection('classes');
        const postsCollection = client.db('zymzoo').collection('post');


        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send(token)
        })

        // posts
        app.get('/posts', async(req,res)=>{
            const postsData = await postsCollection.find().toArray()
            res.send(postsData)
        })

        // schedule
        app.get('/schedule', async (req, res) => {
            const result = await weeklySchedule.find().toArray();
            res.send(result)
        })

        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result)
        })

        // user related api
        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email };
            const existingUser = await userDataCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await userDataCollection.insertOne(user)
            res.send(result)
        })


        // blog data
        app.get('/blogs', async (req, res) => {
            const query = await blogsDataCollection.find().toArray();
            res.send(query)
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const result = { _id: new ObjectId(id) }
            const data = await blogsDataCollection.findOne(result)
            res.send(data)
        })

        // newsletter
        app.post('/news', async (req, res) => {
            const body = req.body;
            const query = await newsletterDataCollection.insertOne(body);
            console.log(query);
            res.send(query)
        })
        app.get('/news', async (req, res) => {
            const query = await newsletterDataCollection.find().toArray()
            res.send(query)
        })

        // gallery
        app.get('/image', async (req, res) => {
            try {
                const limit = parseInt(req.query?.limit) || 0;
                const query = await galleryDataCollection.find().limit(limit).toArray();
                res.send(query)
            } catch (error) {
                res.send(error.message)
            }
        })


        // trainer 

        app.get('/trainers', async (req, res) => {
            try {
                const trainers = await trainerDataCollection.find().toArray();
                res.send(trainers);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.get('/trainers/:id', async (req, res) => {
            const id = req.params.id;
            const result = { _id: new ObjectId(id) };
            const data = await trainerDataCollection.findOne(result);
            res.send(data);
        });

        // apply trainer

        app.patch('/applyTrainers', async (req, res) => {
            try {
                const data = req.body;
                const result = await applyTrainerDataCollection.insertOne(data);
                res.json(result); // Sending the result as JSON
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/applyTrainers', async (req, res) => {
            const query = await applyTrainerDataCollection.find().toArray();
            res.send(query);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running is server');
});
app.listen(port, (req, res) => {
    console.log(`port is runnig on ${port}`);
})


// purnoakter11
// TRSN0w5yJWi0eOTP