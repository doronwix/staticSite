var express = require('express');
var app = express();
app.disable('etag');

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
                            
  // Request methods you wish to allow
  res.setHeader(
  "Access-Control-Allow-Methods",
  "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
  "Access-Control-Allow-Headers",
  "*"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
 
  // Pass to next layer of middleware
  next();
});

app.get('/webpl3/api/tradingsignals/GetClientSignalsPermissions', function(req, res) {
  res.send([{ "status":"1", "result":"False", "signalsEndDate":"12/08/2018 16:00:02" }]);
});

app.get('/webpl3/api/retention/MessagesTokenUrl', function(req, res) {
  res.send("AD2BDD8C4A053C5A0706C9B431E2C48F8AD8E20AF14C02AE2E90DCF346F8D8B4ECB24EABC86182EACFDFFD67E03674A7B812712A954524E7D5315E7D2F301E39503FF3FB0AEE444568C02911AFD788E6BD2EE14A361FD6EDE8556976AE06FD78F9CFE738880BCBB1AE10BF3A2003BC2EC064E960E6AACD19C37B6F7F0A0A047EC228018EBFB4CA5420420B7833FCDE5C4AEB5B90FAB6FBA2C6064EFB05621F9D1FD62062");
});


app.get('/webpl3/api/clientstate/KeepAlive', function(req, res) {
  res.send({"result": [1,0], "securityToken":1230168742, "userLoggedIn":true, "isSessionGap":false });
});


app.get('/webpl3/api/clientstate/getdata', function(req, res) {
  res.send([{
    user: 'john',
    fave_genre: 'science fiction',
    last_book_purchased: 'the light of other days'
  }, {
    user: 'genevieve',
    fave_genre: 'fantasy',
    last_book_purchased: 'game of thrones: a dance with dragons'
  }, {
    user: 'zach',
    fave_genre: 'non-fiction',
    last_book_purchased: 'freakonomics'
  }]);
});
app.get('/api/users', function(req, res) {
  res.send([{
    user: 'john',
    fave_genre: 'science fiction',
    last_book_purchased: 'the light of other days'
  }, {
    user: 'genevieve',
    fave_genre: 'fantasy',
    last_book_purchased: 'game of thrones: a dance with dragons'
  }, {
    user: 'zach',
    fave_genre: 'non-fiction',
    last_book_purchased: 'freakonomics'
  }]);
});
app.get('/api/books', function(req, res) {
  res.send([{
    book: 'the light of other days',
    authors: ['arthur c clarke', 'stephen baxter'],
    genre: 'science fiction'
  }, {
    book: 'game of thrones: a dance with dragons',
    authors: ['george r martin'],
    genre: 'fantasy'
  }, {
    book: 'freakonomics',
    authors: ['stephen j dubner', 'steven d. levitt'],
    genre: 'non-fiction'
  }]);
});
app.get('/api/authors', function(req, res) {
  res.send([{
    name: 'arthur c clarke',
  }, {
    name: 'stephen baxter'
  }, {
    name: 'george r martin'
  }, {
    name: 'stephen j dubner'
  }, {
    name: 'steven d. levitt'
  }]);
});
module.exports = app;