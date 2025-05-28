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

// Middleware
app.use(cors());
app.use(express.json());

// Upewnij się, że katalog data istnieje
async function ensureDataDirectory() {
  const dataDir = join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Inicjalizacja pliku JSON jeśli nie istnieje
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

// GET /api/products - pobierz wszystkie produkty
app.get('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas odczytu danych' });
  }
});

// POST /api/products - dodaj nowy produkt
app.post('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    const newProduct = {
      ...req.body,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    products.push(newProduct);
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas dodawania produktu' });
  }
});

// PUT /api/products/:id - aktualizuj produkt
app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    products[index] = {
      ...products[index],
      ...req.body,
      dateModified: new Date().toISOString(),
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas aktualizacji produktu' });
  }
});

// DELETE /api/products/:id - usuń produkt
app.delete('/api/products/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    let products = JSON.parse(data);
    const initialLength = products.length;

    products = products.filter((p) => p.id !== req.params.id);

    if (products.length === initialLength) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas usuwania produktu' });
  }
});

// Inicjalizacja i uruchomienie serwera
async function startServer() {
  await ensureDataDirectory();
  await initializeDataFile();

  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
}

startServer();
