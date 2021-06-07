const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const { title } = require("process");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("client/build"));

const products_url = "/api/products";

const ProductSchema = mongoose.Schema({
  title: { type: String, required: [true, "Title required"] },
  price: {
    type: Number,
    validate: [(v) => v > 0, "Must be a positive number"],
    required: [true, "Price required"],
  },
  description: { type: String, required: [true, "Description required"] },
  category: { type: String, required: [true, "Category required"] },
  image: { type: String, required: [true, "Image required"] },
});

const Product = mongoose.model("Product", ProductSchema);

app.get(products_url, (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;

  const query = {
    ...(!!category && { category: category }),
    ...(!!minPrice && { price: { $gte: minPrice } }),
    ...(!!maxPrice && { price: { $lte: maxPrice } }),
    ...(!!search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    }),
  };

  Product.find(query)
    .exec()
    .then((products) => res.send(products))
    .catch((error) => {
      res.status(500);
      res.send(error.message);
    });
});

app.get(`${products_url}/:id`, (req, res) => {
  const { id } = req.params;

  Product.findById(id)
    .then((product) => res.send(product))
    .catch((error) => {
      res.status(500);
      res.send(error.message);
    });
});

app.post(`${products_url}`, (req, res) => {
  const { title, price, description, category, image } = req.body;

  Product.insertMany({ title, price, description, category, image })
    .then((inserted) => res.send(inserted))
    .catch((error) => {
      res.status(500);
      res.send(error.message);
    });
});

app.put(`${products_url}/:id`, (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, image } = req.body;

  const updateQuery = {
    ...(title && { title }),
    ...(!!price && { price }),
    ...(!!description && { description }),
    ...(!!category && { category }),
    ...(!!image && { image }),
  };

  Product.findByIdAndUpdate(id, updateQuery, { new: true })
    .then((product) => res.send(product))
    .catch((error) => {
      res.status(500);
      res.send(error.message);
    });
});

app.delete(`${products_url}/:id`, (req, res) => {
  const { id } = req.params;

  Product.findByIdAndRemove(id)
    .then((product) => res.send(product))
    .catch((error) => {
      res.status(500);
      res.send(error.message);
    });
});

const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 9090);
    console.log("Connected...");
  });
