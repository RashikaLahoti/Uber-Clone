import express from 'express';
import authRoutes from "./modules/auth/auth.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import driverRoutes from "./modules/driver/driver.routes.js";
import { swaggerSpec } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        url: '/api-docs/json'
    }
}));

// Alternative JSON spec endpoint
app.get('/api-docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/hello', (req, res) => {
    res.send('Welcome to the Uber Clone API');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/driver', driverRoutes);

export default app;