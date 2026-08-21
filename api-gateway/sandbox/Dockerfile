# 1. Use a very lightweight version of Linux with Node.js pre-installed
FROM node:20-alpine

# 2. Create a specific directory inside the container for our work
WORKDIR /app

# 3. Create a non-root user for security (so the code doesn't have admin rights)
RUN addgroup -S sandboxgroup && adduser -S sandboxuser -G sandboxgroup

# 4. Give the new user ownership of the working directory
RUN chown -R sandboxuser:sandboxgroup /app

# 5. Switch to the non-root user
USER sandboxuser

# 6. We will eventually copy the user's code here and run it
# For now, this just keeps the container ready
CMD ["node", "-v"]