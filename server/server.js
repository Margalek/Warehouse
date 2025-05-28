import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = join(__dirname, 'data', 'warehouse.json');
const META_FILE = join(__dirname, 'data', 'meta.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Initialize JSON files if they don't exist
async function initializeDataFiles() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }

  try {
    await fs.access(META_FILE);
  } catch {
    await fs.writeFile(META_FILE, JSON.stringify({ lastId: 0 }));
  }
}

// Get the next available product ID
async function getNextProductId() {
  try {
    const metaData = await fs.readFile(META_FILE, 'utf8');
    const meta = JSON.parse(metaData);
    const nextId = meta.lastId + 1;
    meta.lastId = nextId;
    await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2));
    return `P${nextId.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating next product ID:', error);
    throw error;
  }
}

// GET /api/products - get all products
app.get('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error reading data' });
  }
});

// POST /api/products - add new product
app.post('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    const newProduct = {
      ...req.body,
      id: await getNextProductId(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    products.push(newProduct);
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error adding product' });
  }
});

// PUT /api/products/:id - update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = {
      ...products[index],
      ...req.body,
      dateModified: new Date().toISOString(),
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

// DELETE /api/products/:id - delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    let products = JSON.parse(data);
    const initialLength = products.length;

    products = products.filter((p) => p.id !== req.params.id);

    if (products.length === initialLength) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// Initialize and start server
async function startServer() {
  await ensureDataDirectory();
  await initializeDataFiles();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
