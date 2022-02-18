const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;

require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
app.listen(port, () => console.log("Server Running"));

// var auth = new googleAuth();

const myOAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.CLIENT_URL
  )

myOAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
    });

const myAccessToken = myOAuth2Client.getAccessToken();

const contactEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: "OAuth2",
      user: process.env.USER, //your gmail account you used to set the project up in google cloud console"
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: myAccessToken //access token variable we defined earlier
    // auth: {
    //   user: process.env.USER,
    //   pass: process.env.PASS,
    // },
  }});
  
  contactEmail.verify((error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Ready to Send");
    }
  });

  router.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    const to = req.body.to;
    const mail = {
      from: email,
      to: to,
      subject: `Message from ${req.body.email}`,
      html: `<p>Name: ${name}</p>
             <p>Email: ${email}</p>
             <p>Message: ${message}</p>`,
    };
    contactEmail.sendMail(mail, (error) => {
      if (error) {
        res.json({ status: "ERROR" });
      } else {
        res.json({ status: "Message Sent" });
      }
    });
  });
  