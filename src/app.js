//entry point
import express from 'express'
import cors from 'cors'
import { testConnection } from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import env from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js';
import authenticate from './middleware/auth.js'
import authorize from './middleware/rbac.js'
import userRoutes from './modules/users/users.routes.js';
import recordRoutes from './modules/records/records.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Finance dashboard API is running',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
    })
})

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/records', recordRoutes);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null,
    })
})

//global error handler
app.use(errorHandler);

//start server
const startServer = async () => {
    await testConnection();
    app.listen(env.port, () => {
        console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    })
}

startServer();