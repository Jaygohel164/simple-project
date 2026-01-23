# ============================================
# DOCKERFILE FOR BACKEND
# ============================================

# Step 1: Use Node.js base image
# WHY: We need Node.js environment to run our JavaScript code
FROM node:18-alpine

# Step 2: Set working directory inside container
# WHY: This is where our app code will live inside the container
WORKDIR /app

# Step 3: Copy package.json first (for caching)
# WHY: Docker caches layers. If package.json doesn't change,
#      Docker won't reinstall packages (saves time)
COPY package.json .

# Step 4: Install dependencies
# WHY: Download all required npm packages
RUN npm install

# Step 5: Copy all source code
# WHY: Now copy the actual application code
COPY . .

# Step 6: Expose port
# WHY: Tell Docker this container listens on port 5000
EXPOSE 5000

# Step 7: Start the application
# WHY: Command to run when container starts
CMD ["npm", "start"]
