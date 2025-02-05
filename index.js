const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected successfully");
    await client.connect();
    const database = client.db("hungry-kitchen");
    const foodsCollection = database.collection("foods");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    //Foods Collectios--------------------
    app.post("/foods", async (req, res) => {
      const foods = req.body;
      const saveFood = await foodsCollection.insertOne(foods);
      console.log(foods);
      res.json(saveFood);
    });
    app.get("/foods", async (req, res) => {
      const cursor = foodsCollection.find({});
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.json(result);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const foods = await foodsCollection.deleteOne(filter);
      console.log(foods);
      res.send(foods);
    });
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const {
        foodName,
        type,
        category,
        foodDescription,
        price,
        foodImage,
        resturantName,
      } = req.body;
      const filter = { _id: ObjectId(id) };
      const updateFood = {
        $set: {
          foodName,
          type,
          category,
          foodDescription,
          price,
          foodImage,
          resturantName,
        },
      };
      const result = await foodsCollection.updateOne(filter, updateFood);
      res.json(result);
    });

    app.get("/category", async (req, res) => {
      const category = req.query.category;
      const query = { category: category };
      const cursor = foodsCollection.find(query);
      const categories = await cursor.toArray();
      res.json(categories);
    });
    app.get("/mealTime", async (req, res) => {
      const mealTime = req.query.mealTime;
      const query = { mealTime: mealTime };
      const cursor = foodsCollection.find(query);
      const getMealTime = await cursor.toArray();
      res.json(getMealTime);
    });
    // Orders collections ---------
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const deleteOrder = await ordersCollection.deleteOne(filter);
      res.json(deleteOrder);
    });

    // order update api
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: id };
      const updateOrder = {
        $set: {
          orderStatus: req.body.orderStatus,
          riderStatus: req.body.riderStatus,
        },
      };
      const result = await ordersCollection.updateOne(filter, updateOrder);
      res.json(result);
    });

    // users collections ---------
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    app.get("/role", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const cursor = usersCollection.find(query);
      const orles = await cursor.toArray();
      res.json(orles);
    });

    // users data post to mongodb
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log("user result", result);
      res.json(result);
    });

    // make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateUser = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateUser);
      res.json(result);
    });

    // check admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json(user);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Hungry Kitchen database!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});

// server link: https://hungry-kitchen-app.herokuapp.com/
