const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error.js');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const mysql = require('mysql2');


// Load env vars
dotenv.config({ path: './config/config.env' });

// Routes files
const users = require('./routes/users.js');
const auth = require('./routes/auth.js');
const applcation = require('./routes/application.js');
const logs = require('./routes/log.js');

const app = express();

// Body parser

app.use(express.json());

// Middleware

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
}


// Security headers
app.use(helmet());

// Prevent xss attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 100,
    max: 100
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable Cors error

app.use(cors());

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/applications', applcation);
app.use('/api/v1/logs', logs);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port`));

//Unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});