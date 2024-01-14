require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API Listening' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`App listening at http://localhost:${port}`);
});
