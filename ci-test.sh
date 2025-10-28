#!/bin/bash

# CI Test Script - Local Development
# This script simulates the CI pipeline locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Local CI Simulation...${NC}\n"

# Backend Tests
echo -e "${YELLOW}📦 Testing Backend...${NC}"
cd backend

echo "🔧 Installing backend dependencies..."
bun install --frozen-lockfile

echo "🔍 Type checking backend..."
bun run type-check || (echo -e "${RED}❌ Backend type check failed${NC}" && exit 1)

echo "📝 Linting backend..."
bun run lint:check || (echo -e "${RED}❌ Backend lint failed${NC}" && exit 1)

echo "✨ Format checking backend..."
bun run format:check || (echo -e "${RED}❌ Backend format check failed${NC}" && exit 1)

echo "🧪 Testing backend..."
bun test || (echo -e "${RED}❌ Backend tests failed${NC}" && exit 1)

echo "🏗️ Building backend..."
bun run build || (echo -e "${RED}❌ Backend build failed${NC}" && exit 1)

echo -e "${GREEN}✅ Backend tests passed!${NC}\n"

# Frontend Tests
cd ../frontend

echo -e "${YELLOW}🌐 Testing Frontend...${NC}"

echo "📦 Installing frontend dependencies..."
bun install --frozen-lockfile

echo "🔍 Type checking frontend..."
bun run type-check || (echo -e "${RED}❌ Frontend type check failed${NC}" && exit 1)

echo "📝 Linting frontend..."
bun run lint:check || (echo -e "${RED}❌ Frontend lint failed${NC}" && exit 1)

echo "✨ Format checking frontend..."
bun run format:check || (echo -e "${RED}❌ Frontend format check failed${NC}" && exit 1)

echo "🧪 Testing frontend..."
bun run test || (echo -e "${RED}❌ Frontend tests failed${NC}" && exit 1)

echo "🏗️ Building frontend..."
bun run build || (echo -e "${RED}❌ Frontend build failed${NC}" && exit 1)

echo -e "${GREEN}✅ Frontend tests passed!${NC}\n"

# Integration Tests
cd ..

echo -e "${YELLOW}🐳 Testing Docker Integration...${NC}"

echo "🏗️ Building Docker image..."
docker build -t wahub:test . || (echo -e "${RED}❌ Docker build failed${NC}" && exit 1)

echo "📊 Checking Docker image..."
docker images wahub:test

echo -e "${GREEN}✅ Docker integration test passed!${NC}\n"

echo -e "${GREEN}🎉 All CI tests passed successfully!${NC}"
echo -e "${GREEN}✨ Your code is ready for deployment!${NC}"