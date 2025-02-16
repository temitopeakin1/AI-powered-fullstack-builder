ARG BASE=node:20.18.0
FROM ${BASE} AS base

WORKDIR /app

# Install dependencies (this step is cached as long as the dependencies don't change)
COPY package.json package-lock.json ./

RUN npm install

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