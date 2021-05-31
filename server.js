const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const products_url = "/products";
const products_file = "products.json";

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
  try {
    readProducts((productsArray) => {
      const result = productsArray.filter(
        (p) =>
          (!search ||
            p.title.includes(search) ||
            p.description.includes(search)) &&
          (!category || p.category === category) &&
          (!minPrice || p.price >= +minPrice) &&
          (!maxPrice || p.price <= +maxPrice)
      );
      res.send(result);
    });
  } catch (error) {
    res.status(500);
    res.send();
  }
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
  try {
    const { title, price, description, category, image } = req.body;
    if (!title || !price || !description || !category || !image) {
      res.status(500);
      res.send("Invalid model");
      return;
    }
    readProducts((productsArray) => {
      const id = Math.max(...productsArray.map((p) => p.id)) + 1;
      const newProduct = { id, title, price, description, category, image };
      writeProducts([...productsArray, newProduct], (err) => {
        res.send(!!err ? "Failed" : "Success");
      });
    });
  } catch (error) {
    res.status(500);
    res.send();
  }
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

app.listen(8082);
