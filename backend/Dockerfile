# Use Ubuntu as base image
FROM ubuntu:22.04

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    libunwind8 \
    libunwind-dev \
    libssl-dev \
    pkg-config \
    build-essential \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install dfx
RUN wget https://sdk.dfinity.org/downloads/dfx/0.25.1/x86_64-linux/dfx-0.25.1.tar.gz \
    && tar -xzf dfx-0.25.1.tar.gz \
    && mv dfx /usr/local/bin/ \
    && rm dfx-0.25.1.tar.gz

# Copy dfx.json first
COPY dfx.json .

# Copy backend source files
COPY backend/ ./backend/

# Copy frontend source files
COPY frontend/ ./frontend/

# Install frontend dependencies and build
RUN cd frontend && npm install && npm run build

# Create necessary directories
RUN mkdir -p frontend/src/declarations/profile \
    && mkdir -p frontend/src/declarations/events

# Initialize dfx
RUN dfx identity new default || true \
    && dfx identity use default

# Initialize the project
RUN dfx start --clean --background \
    && dfx deploy

# Expose the ports
EXPOSE 4943 8000

# Start the replica
CMD ["dfx", "start", "--clean", "--host", "0.0.0.0:4943"]