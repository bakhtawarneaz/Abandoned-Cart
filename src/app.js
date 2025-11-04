const Fastify = require('fastify');
const sequelize = require('./config/db');

const app = Fastify({ logger: true });

// Import Routes
const storeRoutes = require('./routes/store.routes');
const whatsappTemplateRoutes = require('./routes/whatsappTemplate.routes');
const abandonedCartRoutes = require('./routes/abandonedCart.routes');
const orderRoutes = require('./routes/order.routes');

app.register(storeRoutes, { prefix: '/api' });
app.register(whatsappTemplateRoutes, { prefix: '/api' });
app.register(abandonedCartRoutes, { prefix: '/api' });
app.register(orderRoutes, { prefix: '/api' });

// Connect DB
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('✅ Database synced and all models connected');
    require('./jobs/abandonedCart.job');
  })
  .catch((err) => console.error('❌ DB sync error:', err.message));


module.exports = app;