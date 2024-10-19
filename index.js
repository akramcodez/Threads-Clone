const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public/assets")));
app.use(express.static(path.join(__dirname, "/public/css")));

let data = require("./data.json");
const { console } = require("inspector");

const isIdMissing = data.some((item) => item.id === "no-id");

if (isIdMissing) {
  data = data.map((item) => {
    if (item.id === "no-id") {
      return {
        ...item,
        id: uuidv4(),
      };
    }
    return item;
  });
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  console.log("IDs updated in data.json");
} else {
  console.log("No IDs were updated.");
}

app.get("/threads.net", (req, res) => {
  res.render("home.ejs", { data });
});

app.get("/threads.net/new", (req, res) => {
  res.render("new.ejs", { data });
});

app.get("/threads.net/search", (req, res) => {
  res.render("search.ejs");  
});

app.get("/threads.net/profile", (req, res) => {
  res.render("profile.ejs");  
});

app.get("/threads.net/:id", (req, res) => {
  const { id } = req.params;
  const post = data.find((p) => p.id === id);

  if (!post) {
    console.error(`Post with ID ${id} not found.`);
    return res.status(404).send("Post not found");
  }

  res.render("show.ejs", { post });
});


app.post("/threads.net/new", (req, res) => {
  const { newthread } = req.body;

  const newPost = {
    id: uuidv4(),
    username: "akramcodez",  
    name: "Akram",
    profilePic: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQBpXzAc1lfOi6rYS9f_Ezk1pC-LJFNS_HIn_LN8--TZSg8AT1T",
    content: newthread,
    likes: Math.floor(Math.random() * 1000) + 500,
    commentCount: Math.floor(Math.random() * 600) + 200,
    followersCount: 10000,
    extra:
      "I'm SK Akram, a passionate web developer from India. Currently, I'm diving deep into the MERN stack.",
    button: "yes"
  };

  data.unshift(newPost);
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  res.redirect("/threads.net");
});


app.patch("/threads.net/:id", (req, res) => {
  let { id } = req.params;
  const { content } = req.body; 

  const postIndex = data.findIndex((p) => p.id === id);

  if (postIndex === -1) {
      return res.status(404).send("Post not found");
  }

  data[postIndex].content = content;

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  res.redirect(`/threads.net/${id}`); 
});


app.get("/threads.net/:id/edit", (req, res) => {
    const { id } = req.params; 
    const post = data.find((p) => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit.ejs", { post, data }); 
});

app.delete("/threads.net/:id",(req,res) => {
  let { id } = req.params;
  data = data.filter((p) => p.id !== id);

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.redirect(`/threads.net`); 
})


app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
