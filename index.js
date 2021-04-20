const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

// ===========================================================

// PORT:
const port = 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('service'));
app.use(fileUpload());

// MONGODB CONNECTION
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ldzw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://dynamicsoft:dynamicsoft7@cluster0.1ldzw.mongodb.net/dynamicSoft?retryWrites=true&w=majority";
// console.log(process.env.DB_USER);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  //================================== ALL COLLECTION ======================================
  const serviceCollection = client.db('dynamicSoft').collection('services');
  const reviewCollection = client.db('dynamicSoft').collection('review');
  const orderCollection = client.db('dynamicSoft').collection('reg');
  const adminCollection = client.db('dynamicSoft').collection('admin');

  console.log("database connection established");

  //ADD SERVICE (CREATE) ======================================

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64'),
    };

    serviceCollection.insertOne({ title, description, price, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  //========================= READ SERVICE AND SHOW (READ) ===================================
  app.get('/services', (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
// delete service by admin =================================

  app.delete('/delete/:id', (req, res) => {
    serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
        .then(result => {
            res.send(result.deletedCount > 0);
        })
   })


  //ADD FEEDBACK/ REVIEWS (CREATE)======================================
  app.post('/addReview', (req, res) => {
    const feedback = req.body;
    reviewCollection.insertOne(feedback).then((result) => {
      // console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  //READ FEEDBACK/ REVIEWS AND SHOW (READ)===================================
  app.get('/reviews', (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //ADD SERVICE REGISTRATION (CREATE) ============================
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // get all order in admin side============================
  app.get("/orderList", (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  // update order status by admin ============================
  app.patch('/update/:id', (req, res) => {
    orderCollection.updateOne({ _id: ObjectId(req.params.id) }, {
      $set: { status: req.body.status }
    })
      .then(result => {
        res.send(result.modifiedCount > 0);
      })
  })


  //SHOW LOGGED IN CLIENT SERVICE LIST (READ) ==============================

  app.get('/clientServices/:email', (req, res) => {
    // const email = req.body.email;
    console.log(req.params.email);
    orderCollection.find({ email: req.params.email })
      .toArray((err, documents) => {
        console.log(documents);
        res.send(documents);
      })
  })

  // Admin dashboard, show all register (Read)============================
  app.get('/adminServices', (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //ADD ADMIN =================================================
  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin).then((result) => {
      // console.log(result)
      res.send(result.insertedCount > 0);
    });
  });

  //VERIFY ADMIN LOGIN =========================================
  app.get('/isAdmin/:email', (req, res) => {
    // const email = req.body.email;
    console.log(req.params.email);
    adminCollection.find({ email: req.params.email })
      .toArray((err, admins) => {
        console.log(admins);
        res.send(admins.length > 0);
      })
  })


});

// Root ============================
app.get('/', (req, res) => {
  res.send('hello mongo');
});

// Listener port ============================
app.listen(process.env.PORT || port);
















//============================== ADD SERVICE (CREATE) ======================================
// app.post('/addService', (req, res) => {
//   const service = req.body;
//   serviceCollection.insertOne(service).then((result) => {
//     // console.log(result)
//     res.send(result.insertedCount > 0);
//   });
// });
