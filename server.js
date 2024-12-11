const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } = require('firebase/firestore');
const { jsPDF } = require('jspdf');

const app = express();
const port = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: "AIzaSyCKPYWBraNSDp5GKyCyMmIMlbHnfPs_LvI",
  authDomain: "fachschaftsraum-3912f.firebaseapp.com",
  projectId: "fachschaftsraum-3912f",
  storageBucket: "fachschaftsraum-3912f.appspot.com",
  messagingSenderId: "944218945134",
  appId: "1:944218945134:web:630a8a24e70b5e1337587f"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(cors());
app.use(bodyParser.json());

app.get('/articles', async (req, res) => {
  try {
    const articles = await getDocs(collection(db, 'articles'));
    res.json(articles.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).send('Error fetching articles');
  }
});

app.post('/articles', async (req, res) => {
  try {
    const article = req.body;
    const docRef = await addDoc(collection(db, 'articles'), article);
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).send('Error adding article');
  }
});

app.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const articleRef = doc(db, 'articles', id);
    await updateDoc(articleRef, updatedData);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send('Error updating article');
  }
});

app.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, 'articles', id));
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send('Error deleting article');
  }
});

app.get('/generate-pdf', async (req, res) => {
  try {
    const articles = await getDocs(collection(db, 'articles'));
    const doc = new jsPDF();
    let y = 10;

    doc.text("Inventory Report", 10, y);
    y += 10;

    articles.docs.forEach((article, index) => {
      const data = article.data();
      doc.text(`${index + 1}. ${data.name} - ${data.amount} (${data.category})`, 10, y);
      y += 10;
    });

    const pdfOutput = doc.output();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfOutput, 'binary'));
  } catch (error) {
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});