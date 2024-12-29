# Use an official image as the base
FROM golang:1.22.5 AS builder

WORKDIR /app

# Copy go.mod and go.sum
COPY Design_Project_Sem5_Backend/go.mod Design_Project_Sem5_Backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY Design_Project_Sem5_Backend/ ./

# Build the Go binary
RUN CGO_ENABLED=0 go build -o main -a -ldflags '-extldflags "-static"' ./cmd/web/.

# Use a minimal base image
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .
COPY Design_Project_Sem5_Backend/.env .env
COPY Design_Project_Sem5_Backend/dist ./dist

# Add necessary certificates
RUN apk --no-cache add ca-certificates

# Set up a non-root user
RUN adduser -D myuser
USER myuser

# Expose the application port
EXPOSE 8080 5432 5433 2358

# Run the application
CMD ["./main"]
