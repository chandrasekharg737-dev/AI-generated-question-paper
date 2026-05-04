const express = require('express');
const app = express();

app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT);
