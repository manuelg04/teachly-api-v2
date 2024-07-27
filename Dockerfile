# Use an official Node runtime as the parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs on
EXPOSE 8500

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "run", "start:prod"]