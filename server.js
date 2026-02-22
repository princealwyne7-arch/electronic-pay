const express = require('express');
const app = express();
app.use(express.json());

const UI = ;

app.get('/', (req, res) => res.send(UI));
app.get('/status', (req, res) => res.json({ todayTotal: 0, history: [] }));
app.listen(process.env.PORT || 3000, () => console.log('Server Live'));