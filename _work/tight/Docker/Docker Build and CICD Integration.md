# Docker Build and CICD Integration

## Questions Covered

1. How can Docker be integrated into a CI/CD pipeline?
2. How do you automate Docker builds using GitHub Actions, Jenkins, or other CI/CD tools?
3. How do you handle automated testing of Docker containers in a CI/CD pipeline?

## How can Docker be integrated into a CI/CD pipeline?

Docker brings environment consistency across build, test, and deploy stages.

### Continuous Integration (CI)

- **Dockerfile** — defines the build environment and application.
- **Build step** — CI tool builds images from the Dockerfile.

**GitHub Actions example:**

```yaml
name: Build and Push Docker Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - run: docker build -t my-app:latest .
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      - run: docker push my-app:latest
```

- **Test** — run unit/integration/e2e tests inside containers after build.

**GitLab CI example:**

```yaml
stages: [build, test]
build:
  stage: build
  script: [docker build -t my-app:latest .]
test:
  stage: test
  script: [docker run my-app:latest pytest]
```

### Continuous Deployment (CD)

- **Push to registry** — Docker Hub, ECR, GCR, etc.
- **Deploy** — to Swarm, Kubernetes, or cloud services (ECS, Cloud Run).

**ECS deploy example:**

```yaml
name: Deploy to ECS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      - run: aws ecs update-service --cluster my-cluster --service my-service --force-new-deployment
```

### Rollback, Monitoring & Automation

- **Rollback** — revert to a previous image or config on failure.
- **Monitoring** — Prometheus, Grafana, ELK for container health.
- **Pipeline automation** — Jenkins, GitHub Actions, GitLab CI, CircleCI.
- **Secrets** — GitHub Secrets, AWS Secrets Manager, Docker secrets — never expose in code.

**Summary:** Build → Test → Push → Deploy → Monitor, with rollback and secure secret management.

## How do you automate Docker builds using GitHub Actions, Jenkins, or other CI/CD tools?

### GitHub Actions

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - run: docker build -t my-app:latest .
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      - run: docker push my-app:latest
```

- `on` — trigger (push to main); `actions/checkout` — clone repo; Buildx — advanced builds; login/push — publish to registry.

### Jenkins

Create a `Jenkinsfile`:

```groovy
pipeline {
  agent any
  environment { DOCKER_CREDENTIALS_ID = 'dockerhub-credentials' }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build Docker Image') { steps { script { docker.build('my-app:latest') } } }
    stage('Push Docker Image') {
      steps {
        withDockerRegistry([credentialsId: "${DOCKER_CREDENTIALS_ID}", url: '']) {
          docker.image('my-app:latest').push('latest')
        }
      }
    }
  }
}
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
stages: [build, deploy]
variables: { DOCKER_DRIVER: overlay2 }
build:
  stage: build
  script: [docker build -t my-app:latest .]
deploy:
  stage: deploy
  script:
    - docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
    - docker push my-app:latest
  only: [main]
```

### CircleCI

`.circleci/config.yml`:

```yaml
version: 2.1
jobs:
  build:
    docker: [{ image: circleci/python:3.7 }]
    steps:
      - checkout
      - setup_remote_docker: { version: 20.10.7, docker_layer_caching: true }
      - run: { name: Build Docker image, command: docker build -t my-app:latest . }
      - run: { name: Login to Docker Hub, command: echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin }
      - run: { name: Push Docker image, command: docker push my-app:latest }
workflows:
  version: 2
  build_and_push:
    jobs: [build]
```

## How do you handle automated testing of Docker containers in a CI/CD pipeline?

### 1. Unit Testing

Run tests inside the built image:

```yaml
name: Build and Test Docker Image
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - run: docker build -t my-app:latest .
      - run: docker run --rm my-app:latest dotnet test
```

### 2. Integration Testing

Use a dedicated container with network access:

```yaml
stages: [build, test]
build:
  stage: build
  script: [docker build -t my-app:latest .]
integration_test:
  stage: test
  services: [docker:dind]
  script: [docker run --network host my-app:latest npm run test:integration]
```

### 3. End-to-End Testing

Use frameworks like Cypress, Selenium, or Puppeteer in Docker:

```yaml
version: 2.1
jobs:
  build:
    docker: [{ image: circleci/node:14 }]
    steps:
      - checkout
      - run: { name: Install Dependencies, command: npm install }
      - run: { name: Build Docker Image, command: docker build -t my-app:latest . }
  e2e:
    docker: [{ image: cypress/included:8.7.0 }]
    steps:
      - checkout
      - run: { name: Run End-to-End Tests, command: npx cypress run }
workflows:
  version: 2
  build_and_test:
    jobs: [build, { e2e: { requires: [build] } }]
```

### 4. Security / Vulnerability Scanning

Scan with Trivy, Clair, or Anchore:

```yaml
- name: Scan Docker Image
  uses: aquasecurity/trivy-action@v1
  with:
    image-ref: my-app:latest
```

### 5. Mocking with Docker Compose

Spin up dependencies alongside the app:

```yaml
stages: [build, test]
services: [docker:dind]
build:
  stage: build
  script: [docker-compose build]
test:
  stage: test
  script:
    - docker-compose up -d
    - docker-compose run my-app npm test
    - docker-compose down
```

**Summary:** Unit tests in-container → integration tests with networking → e2e with test frameworks → vulnerability scans → Compose for mock services.
