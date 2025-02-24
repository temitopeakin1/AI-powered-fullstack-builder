ARG BASE=node:20.18.0
FROM ${BASE} AS base

WORKDIR /app

# Install dependencies (this step is cached as long as the dependencies don't change)
COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

# Check the installed version of 'ai' and fail if incorrect
RUN apt-get update && apt-get install -y jq \
 && EXPECTED_AI_VERSION="4.1.6" \
 && AI_VERSION=$(npm list ai --json | jq -r '.dependencies.ai.version') \
 && if [ "$AI_VERSION" != "$EXPECTED_AI_VERSION" ]; then \
      echo "Error: 'ai' package must be version $EXPECTED_AI_VERSION, but found $AI_VERSION"; \
      exit 1; \
    fi

# Copy the rest of your app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Production image
FROM base AS biela-ai-production

# Define environment variables with default values or let them be overridden
ARG VITE_LOG_LEVEL=debug

ENV WRANGLER_SEND_METRICS=false \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    RUNNING_IN_DOCKER=true

# Pre-configure wrangler to disable metrics
RUN mkdir -p /root/.config/.wrangler && \
    echo '{"enabled":false}' > /root/.config/.wrangler/metrics.json

RUN npm run build

CMD [ "npm", "run", "dockerstart"]

# Development image
FROM base AS biela-ai-development

# Define the same environment variables for development
ARG VITE_LOG_LEVEL=debug

ENV VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    RUNNING_IN_DOCKER=true

RUN mkdir -p ${WORKDIR}/run
CMD npm run dev --host