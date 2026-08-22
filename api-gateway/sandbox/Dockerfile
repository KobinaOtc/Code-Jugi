# 1. Use a very lightweight version of Linux with Node.js pre-installed
FROM node:20-alpine

# 2. Create a specific directory inside the container for our work
WORKDIR /app

# 3. Create a non-root user for security
RUN addgroup -S sandboxgroup && adduser -S sandboxuser -G sandboxgroup

# 4. Give the new user ownership of the working directory
RUN chown -R sandboxuser:sandboxgroup /app

# 5. COPY OUR WRAPPER SCRIPT INTO THE CONTAINER
COPY runner.js /app/runner.js

# 6. Switch to the non-root user
USER sandboxuser

# 7. We will leave the CMD blank because our API Gateway will dictate the exact command later