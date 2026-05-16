import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 4000);
const staticPath = path.resolve(__dirname, '../dist');

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Serve built client assets in production
app.use(express.static(staticPath));
app.get('*', (_, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Clinova backend running at http://localhost:${port}`);
});