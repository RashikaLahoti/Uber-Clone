import express from 'express';
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/hello', (req, res) => {
    res.send('Welcome to the Uber Clone API');
});

app.use('/api/auth', authRoutes);

export default app;