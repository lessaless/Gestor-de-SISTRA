// db/connect.js
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = mongoose;
