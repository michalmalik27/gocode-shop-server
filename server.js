const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const { title } = require("process");

const app = express();
app.use(express.json());

const products_url = "/products";
const products_file = "products.json";

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

const readProducts = (callback) => {
  fs.readFile(products_file, "utf8", (err, products) => {
    const productsArray = JSON.parse(products);
    callback(productsArray);
  });
};

const writeProducts = (products, callback) => {
  fs.writeFile(products_file, JSON.stringify(products), (err) => {
    callback(err);
  });
};

app.get(products_url, (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;

  const searchRegex = `/${search}/`;
  const query = {
    ...(category && { category: category }),
    ...(minPrice && { price: { $gte: minPrice } }),
    ...(maxPrice && { price: { $lte: maxPrice } }),
    // ...(search && { title: /search/ }),
  };
  //https://stackoverflow.com/a/40560953

  console.log(query);

  //         p.description.includes(search)) &&
  //       (!category || p.category === category) &&

  Product.find(query)
    .exec()
    .then((products) => res.send(products));

  // readProducts((productsArray) => {
  //   const result = productsArray.filter(
  //     (p) =>
  //       (!search ||
  //         p.title.includes(search) ||
  //         p.description.includes(search)) &&
  //       (!category || p.category === category) &&
  //       (!minPrice || p.price >= +minPrice) &&
  //       (!maxPrice || p.price <= +maxPrice)
  //   );
  //   res.send(result);
  // });
});

app.get(`${products_url}/:id`, (req, res) => {
  try {
    readProducts((productsArray) => {
      const product = productsArray.find((item) => item.id === +req.params.id);
      res.send(product);
    });
  } catch (error) {
    res.status(500);
    res.send();
  }
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
  try {
    const { title, price, description, category, image } = req.body;
    const { id } = req.params;

    readProducts((productsArray) => {
      const product = productsArray.find((p) => p.id === +id);
      if (!product) {
        res.status(500);
        res.send("Product not exists");
        return;
      }

      product.title = title || product.title;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.image = image || product.image;

      const updatedProductsArray = productsArray.map((p) =>
        p.id === +id ? product : p
      );

      writeProducts(updatedProductsArray, (err) => {
        res.send(!!err ? "Failed" : "Success");
      });
    });
  } catch (error) {
    res.status(500);
    res.send();
  }
});

app.delete(`${products_url}/:id`, (req, res) => {
  try {
    readProducts((productsArray) => {
      const products = productsArray.filter(
        (item) => item.id !== +req.params.id
      );
      writeProducts(products, (err) => {
        res.send(!!err ? "Failed" : "Success");
      });
    });
  } catch (error) {
    res.status(500);
    res.send();
  }
});

mongoose
  .connect("mongodb://localhost/my_database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(8080);
    console.log("Connected...");
  });
