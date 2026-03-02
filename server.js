import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));
app.use((req,res)=>res.sendFile(path.join(__dirname,'dist/index.html')));

app.listen(PORT,()=>console.log(`--- AI COMMAND CENTER ONLINE ON PORT ${PORT} ---`));
