# AGRIBOT Enterprise Deployment & Testing Playbook

This document details production-ready guidelines for deploying and testing the **AGRIBOT** platform inside various cloud and developer systems.

---

## ☁️ CLOUD DEPLOYMENT BLUEPRINTS

### 1. AWS (ECS & Fargate)
1. **Push Container to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t agribot .
   docker tag agribot:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/agribot:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/agribot:latest
   ```
2. **Deploy via ECS Fargate**:
   - Create an ECS Cluster using the **Fargate (Serverless)** platform.
   - Configure a Task Definition mapping Port **3000** for TCP traffic.
   - Inject the model secret `GEMINI_API_KEY` from **AWS Secrets Manager** as an environment variable task mapping.
   - Attach an EFS (Elastic File System) volume mapped to `/app/db.json` inside the task configuration to persist database actions.

### 2. Microsoft Azure (App Service for Containers)
1. **Push Container to ACR**:
   ```bash
   az acr login --name agribotregistry
   docker tag agribot:latest agribotregistry.azurecr.io/agribot:latest
   docker push agribotregistry.azurecr.io/agribot:latest
   ```
2. **Launch Application**:
   - Establish an **App Service** using Linux and selected Docker Container deployment.
   - Under Configuration -> Application Settings, input the environment variables:
     - `GEMINI_API_KEY` (Sourced securely from Azure Key Vault reference).
     - `WEBSITES_PORT_BIT` -> Set to `3000` to direct routing traffic properly.
   - In App Service Mounts, attach an Azure Files Share to mount your persistent `/app` database path.

### 3. Render / Railway
1. **Repository Synchronization**:
   - Connect your GitHub repository to Render/Railway.
2. **Runtime configurations**:
   - Select **Web Service** or **Docker Service** runtime (detects Dockerfile instantly).
   - In values and secrets, define `GEMINI_API_KEY` and `JWT_SECRET`.
   - Setup a persistent Volume mount path:
     - Mount Path: `/app/db.json` size `1GiB`.

---

## 🧪 TESTING PLAYBOOK

To guarantee corporate verification, the platform implements unified endpoint testing guidelines.

### 1. Frontend Component Testing (Vitest)
Create a test file `src/tests/App.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('AGRIBOT Landing Page elements', () => {
  it('should render the brand title', () => {
    render(<App />);
    expect(screen.getByText('AGRIBOT')).toBeInTheDocument();
  });
});
```

### 2. Backend Automated API Tests (Supertest / Pytest style)
Our NodeJS Express route checks can be validated via standard framework test libraries matching Flask templates:
```javascript
const request = require('supertest');
const { app } = require('../server');

describe('AGRIBOT Rest Protocols', () => {
  it('POST /api/auth/register should fail on empty fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: '' });
    expect(res.statusCode).toEqual(400);
  });
});
```
