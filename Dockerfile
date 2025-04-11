# Use Ubuntu as base image
FROM ubuntu:22.04

# Set working directory
WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    libunwind8 \
    libunwind-dev \
    libssl-dev \
    pkg-config \
    build-essential \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install dfx
RUN wget https://sdk.dfinity.org/downloads/dfx/0.25.1/x86_64-linux/dfx-0.25.1.tar.gz \
    && tar -xzf dfx-0.25.1.tar.gz \
    && mv dfx /usr/local/bin/ \
    && rm dfx-0.25.1.tar.gz

# Copy dfx.json first
COPY . .

# Install frontend dependencies and build
RUN  npm install && npm run build

# Create necessary directories
RUN mkdir -p frontend/src/declarations/events


# RUN dfx start --host 0.0.0.0:${PORT} --background && sleep 5 

RUN dfx start  --host 0.0.0.0:8100 --background && \
    sleep 3 && \
    dfx canister create frontend && \
    dfx canister create events && \
    dfx canister create profile && \
    dfx canister create frontend && \
    dfx canister create internet-identity && \
    dfx build events && \
    dfx deploy events
    # Initialize dfx
# RUN dfx identity new default || true \
#     && dfx identity use default


RUN dfx build
# Initialize the project
# RUN dfx deploy


# Start the replica