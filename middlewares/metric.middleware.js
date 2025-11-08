const responseTime = require('response-time');
const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;

// --- Loki & Winston Setup ---
const winston = require('winston');
const LokiTransport = require('winston-loki');

// ⚠️ Configuration: Update the host, port, and labels as needed for your Loki setup
const lokiConfig = {
    host: 'http://127.0.0.1:3100',
    format: winston.format.json(),
    level: 'info' 
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new LokiTransport(lokiConfig)
    ]
});
// -----------------------------

// 1. Prometheus Metric Definitions
collectDefaultMetrics({ register: client.register });

const reqResTime = new client.Histogram({
    name: "express_backend_manas_request_duration_ms",
    help: "This will tell how much time is taken by request and response (in ms)",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 50, 100, 200, 400, 800, 1000, 2000, 5000]
});

const totalReqCounter = new client.Counter({
    name: "total_req_by_manas",
    help: "It will tell the total requests"
});

// Function to capture the response body before it's sent
const captureResponseBody = (req, res, next) => {
    // Monkey-patch res.send and res.json
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Store the response data in a local variable
    res.locals.responseBody = null; 

    res.send = function (data) {
        res.locals.responseBody = data ? String(data) : 'No Content';
        originalSend.apply(res, arguments);
    };

    res.json = function (data) {
        try {
            // Capture the JSON object for structured logging
            res.locals.responseBody = JSON.parse(JSON.stringify(data));
        } catch (e) {
            res.locals.responseBody = data;
        }
        originalJson.apply(res, arguments);
    };
    
    // You can also capture IP/Location here if needed
    // req.locals = { ip_address: req.ip, location: 'Mock' }; 

    next();
};

// 2. Request Tracking Middleware (Logs success/4xx/5xx responses)
const metricsMiddleware = responseTime((req, res, time) => {
    
    let routePath;
    if (req.route) {
        routePath = req.route.path;
    } else {
        routePath = req.originalUrl.split('?')[0]; 
    }
    
    if (routePath !== "/metrics") {
        totalReqCounter.inc();
        
        // Prometheus Metric Observation
        reqResTime
            .labels({
                method: req.method,
                route: routePath,
                status_code: res.statusCode,
            })
            .observe(time);
            
        // Loki Logging for ALL COMPLETED REQUESTS (Success and Error Statuses)
        // Log at 'info' level unless status is 5xx, which should be logged in the error handler.
        if (res.statusCode >= 400) {
            // Error logger will handle 5xx, but we can log a short warning here.
            logger.warn(`Request finished with server error: ${routePath}`, {
                method: req.method,
                route: routePath,
                payload: req.body,
                response : res.locals.responseBody,
                status_code: res.statusCode,
                time_ms: time,
            });
        } else {
            logger.info(`Request completed for ${routePath}`, {
                method: req.method,
                route: routePath,
                status_code: res.statusCode,
                time_ms: time,
                payload: req.body,
                response : res.locals.responseBody,
                response: res.body,
            });
        }
    }
});

// 3. Dedicated Error Logging Middleware (Handles logger.error)
// This must be registered *after* all other app.use() and routes.
const errorLoggerMiddleware = (err, req, res, next) => {
    const routePath = req.originalUrl.split('?')[0];
    
    // Log the error with stack trace to Loki at 'error' level
    // This uses the err object for detailed reporting.
    logger.error(`Unhandled error processing request: ${routePath}`, {
        method: req.method,
        route: routePath,
        error_name: err.name,
        error_message: err.message,
        stack: err.stack,
        ip: req.ip || req.connection.remoteAddress,
        // The status code will be determined by Express or manually set here
        status_code: res.statusCode || 500, 
    });

    // Delegate to Express's built-in error handler for final response
    next(err); 
};


// Export all middleware and the registry
module.exports = {
    metricsMiddleware,
    captureResponseBody,
    errorLoggerMiddleware, // <-- New error handling export
    metricsRegister: client.register
};