
# Use Debian-based Go image to match glibc requirements of go-fitz  
FROM golang:bullseye AS builder

# Install necessary packages for CGO and C libraries
RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    pkg-config \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy go mod files first 
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with CGO enabled
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=amd64
RUN go build -o main .

# Use a minimal Debian runtime image (not Alpine!)
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libmupdf-dev \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /root/

# Copy the binary from builder stage 
COPY --from=builder /app/main .
COPY --from=builder /app/.env* ./

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]