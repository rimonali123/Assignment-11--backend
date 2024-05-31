const express = require('express');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()

const port = process.env.PORT || 5000


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assignment-project-11-c5be4.web.app",
      "https://assignment-project-11-c5be4.firebaseapp.com"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



// MongoDb server code ****
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wods307.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// middlewares for jwtauth
const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}

// const verifyToken = (req, res, next) =>{
//   const token = req?.cookies?.token;
//   // console.log('token in middleware', token);
//   if(!token){
//     return res.status(401).send({message: 'unauthorized access'})
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded) =>{
//     if(err){
//       return res.status(401).send({message: 'unauthorized access'})
//     }
//     req.user = decoded;
//     next();
//   })
// }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)



    // implement collection here
    const serviceCollection = client.db('ServiceDB').collection('services');
    const bookedServiceCollection = client.db('ServiceDB').collection('bookedServices');


    // auth/jwt related api start here
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.cookie('token', token,{
        httpOnly: true,
        secure: true,
        sameSite:'none'
      })
      .send({Success: true});
    })

app.post('/logOut', async(req, res) =>{
  const user = req.body;
  console.log('logging out', user);
  res.clearCookie('token', {maxAge:0})
  .send({success: true})
})




    // implement Functionality here

    // get client side data
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/bookedService', async (req, res) => {
      const cursor = bookedServiceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      console.log('token owner info', req.user);
    })
    app.get('/servicesToDo', async (req, res) => {
      const cursor = bookedServiceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      console.log('token owner info', req.user);
    })

    // get data by id 
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })

    // update data 
    app.put('/services/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateService = req.body;
      const service = {
        $set: {
          name: updateService.name,
          serviceArea: updateService.serviceArea,
          price: updateService.price,
          description: updateService.description,
          image: updateService.image,
        }
      }
      const result = await serviceCollection.updateOne(filter, service, options);
      res.send(result)
    })

    // delete method 
    app.delete('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    })



    // send data mongodb
    app.post('/services', async (req, res) => {
      const newService = req.body;
      console.log(newService);
      const result = await serviceCollection.insertOne(newService);
      res.send(result)
    })


    app.post('/bookedService', async (req, res) => {
      const bookService = req.body;
      console.log(bookService);
      const result = await bookedServiceCollection.insertOne(bookService);
      res.send(result)
    })

    app.get('/bookedService/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookedServiceCollection.findOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('My sever app with nodemon')
})

app.listen(port, () => {
  console.log(`Server app running on port ${port}`)
})