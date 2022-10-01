import express, { urlencoded } from "express";
const app = express();
import session from "express-session";
import mongoose from "mongoose";
import fetch from "node-fetch";

import multer, { diskStorage } from "multer";
import bcryptjs from "bcryptjs";
import path from "path";
const port = process.env.PORT || 8000;
import dotenv from "dotenv";
dotenv.config();

var sess; // a variable for storing session.
app.use("assets", express.static("views/images"));
// middlware for multer
//profile update storage engine
const saveProfiles = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profiles");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Math.random().toString(32).substring(2) + "__" + file.originalname
    );
  },
});
//
// connection to databse

mongoose
  .connect(process.env.MONGO_URI, { useUnifiedTopology: true })
  .then(() => {
    console.log({ msg: "Connected to databse" });
  })
  .catch((err) => console.log({ err }));

const upload_profile = multer({
  storage: saveProfiles,
});

//post thumbnail storage engine
const saveThumbnail = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "thumbnails");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Math.random().toString(32).substring(2) + "__" + file.originalname
    );
  },
});
const upload_thumbnail = multer({
  storage: saveThumbnail,
});

// settings pug engine and views folder
app.use(express.static("javascript"));
app.set("view engine", "pug");
app.set("views", "views");
app.use(
  urlencoded({
    extended: true,
  })
);

// joining  folders
app.use(express.static("profiles"));
app.use(express.static("thumbnails"));

//settings session related stuffs
app.use(
  session({
    secret: "mysecretsessionkeyranomlongstring",
    saveUninitialized: true,
    resave: false,
  })
);

const schema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profile_pic: {
    type: String,
    default: "/user.gif",
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
    default: "Add bio here ! ex. Creating stuffs.",
  },
});

const collection = mongoose.model("users", schema);

//End points

//home page
app.get("/", (req, res) => {
  sess = req.session;

  const url = "http://quotes.stormconsultancy.co.uk/random.json";
  const quote = async () => {
    const obj = await fetch(url);
    const json = await obj.json();

    return json;
  };
  async function render_home() {
    try {
      const blog = await post_collection.find();

      res.status(200).render("home", {
        session: sess,
        blogs: blog,
        quote: await quote(),
      });
    } catch {
      (err) => console.log(err);
    }
  }
  render_home();
});

/*------------------------------------------------------------*/

//individual  post page
app.get("/blog/post/:postid", async (req, res) => {
  const sess = req.session;
  const post = await post_collection.findOne({ _id: req.params.postid });

  res.render("post", {
    post,
    session: sess,
  });
});

/*------------------------------------------------------------*/

// about page !!
app.get("/about", (req, res) => {
  sess = req.session;
  res.status(200).render("about", {
    session: sess,
  });
});

/*------------------------------------------------------------*/

//login page end points
app.get("/login", (req, res) => {
  sess = req.session;
  res.status(200).render("login", {
    session: sess,
  });
});

/*------------------------------------------------------------*/

app.post("/login", (req, res) => {
  const form_values = req.body;
  sess = req.session;
  async function checkCredentials(obj) {
    try {
      const check = await collection.find({
        email: obj.email,
      });

      if (check.length > 0) {
        const hashed_pass = check[0].password;
        const plain_text = obj.password;
        const compare_result = await bcryptjs.compare(plain_text, hashed_pass);
        if (compare_result) {
          sess.user = obj.email;
          sess.username = check[0].fname + " " + check[0].lname;
          sess.profile_pic = check[0].profile_pic;
          res.redirect("/");
        } else {
          res.status(200).render("login", {
            warn: "Invalid credentials , please check email and password",
            session: sess,
          });
        }
      } else {
        res.status(200).render("login", {
          warn: "Invalid credentials , please check email and password",
          session: sess,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  checkCredentials(form_values);
});

/*------------------------------------------------------------*/

// signup page end points
app.get("/signup", (req, res) => {
  sess = req.session;
  res.status(200).render("signup", {
    session: sess,
  });
});

/*------------------------------------------------------------*/

app.post("/signup", (req, res) => {
  sess = req.session;
  const formData = req.body;
  async function saveDetails(obj) {
    try {
      const check = await collection.find({
        email: obj.email,
      });
      if (check.length > 0) {
        res.render("login", {
          msg: `"${obj.email}" This email  already exists , login here .`,
          session: sess,
        });
      } else if (obj.password != obj.cpassword) {
        res.render("signup", {
          msg: `Password and Confirm password do not match`,
          form: obj,
          session: sess,
        });
      } else {
        const hash = await bcryptjs.hash(obj.password, 10);
        obj.password = hash;

        const documentData = await new collection(obj);
        const saveDocument = await documentData.save();
        // console.log(saveDocument);

        res.render("login", {
          msg: `"${obj.email}" Your account has been created successfully , login here.`,
          session: sess,
        });
      }
    } catch (err) {
      // console.log(err);
      res.status(200).render("signup", {
        msg: "All fields are mandatory .",
        form: formData,
        session: sess,
      });
    }
  }

  saveDetails(formData);
});

/*------------------------------------------------------------*/
// bcrypt js

app.get("/hash", (req, res) => {
  const string = "Sanket";
  async function hashing() {
    const hash = await _hash(string, 10);

    const result = await compare(string, hash);
    // console.log(hash, result);
  }
  hashing();
  res.send("Hashed");
});

/*------------------------------------------------------------*/
// logout script
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

/*------------------------------------------------------------*/
// end point for user profile
app.get("/profile", (req, res) => {
  if (req.session.user) {
    async function fetch_user_data(user_email) {
      try {
        const userData = await collection.find({
          email: user_email,
        });
        const userPost = await post_collection.find({
          user: user_email,
        });

        res.render("account.pug", {
          session: req.session,
          user: userData,
          blog: userPost,
        });
      } catch {
        (err) => console.log(err);
      }
    }
    fetch_user_data(req.session.user);
  } else {
    res.status(200).render("login", {
      warn: "Please login first to view your profile.",
      session: req.session,
    });
  }
});

/*------------------------------------------------------------*/

app.post(
  "/profile/update",
  upload_profile.single("display-picture"),
  (req, res) => {
    if (req.file != undefined) {
      var path = req.file.filename;
    } else {
      var path = req.body.current_img;
    }
    const arr = req.body.name.split(" ");
    const last = arr[1].trim();
    const first = arr[0].trim();
    req.body["display-picture"] = path;

    async function update_user() {
      try {
        const result = await collection.updateOne(
          {
            email: req.body.email,
          },
          {
            $set: {
              profile_pic: req.body["display-picture"],
              bio: req.body.bio,
              email: req.body.email,
              fname: first,
              lname: last,
            },
          }
        );
        // console.log(result);
        req.session.profile_pic = req.body["display-picture"];
        req.session.name = req.body.email;
        res.redirect("/profile");
      } catch {
        (err) => console.log(err);
      }
    }
    update_user();
  }
);

/*------------------------------------------------------------*/
// blog post script
//schema for  blog posts
const post_schema = mongoose.Schema({
  thumbnail: String,
  tittle: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: String, required: true },
  username: { type: String, required: true },
  profile_pic: { type: String, required: true },
  time: { type: Date, default: Date.now },
});
const post_collection = mongoose.model("blog_posts", post_schema);

app.post("/post", upload_thumbnail.single("thumbnail"), (req, res) => {
  const blog_document = post_collection({
    thumbnail: req.file.filename,
    tittle: req.body.tittle,
    description: req.body.discription,
    user: req.session.user,
    username: req.session.username,
    profile_pic: req.session.profile_pic,
  });
  blog_document
    .save()
    .then((r) => console.log(r))
    .catch((err) => console.log(err));
  res.redirect("/profile");
});

/*------------------------------------------------------------*/
// starting server
app.listen(port, () => {
  console.log(
    `Application is live now. click here to open in browser : http://localhost:${port}`
  );
});
/*------------------------------------------------------------*/
