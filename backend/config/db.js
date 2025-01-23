import mongoose from "mongoose";

const connectionStates = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
};
export const connectdb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    //console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Check the connection status
    const currentState = mongoose.connection.readyState;
    console.log(`Database connection state: ${connectionStates[currentState]}`);

    // Listen for changes in connection state
    mongoose.connection.on('connected', () => {
        console.log('Mongoose event: Connected');
    });

    mongoose.connection.on('error', (err) => {
        console.error(`Mongoose event: Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose event: Disconnected');
    }); 
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};