# Use a Node.js image
FROM node:16-slim

# Create app directory
WORKDIR /usr/src/app

# Install necessary dependencies for Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Puppeteer so it's available in the container
COPY package*.json ./
RUN npm cache clean --force && npm ci

# Ensure the /node_modules directory exists
RUN mkdir -p /usr/src/app/node_modules

# Add user so we don't need --no-sandbox.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app/node_modules \
    && chown -R pptruser:pptruser /usr/src/app/package.json \
    && chown -R pptruser:pptruser /usr/src/app/package-lock.json

# Run everything after as non-privileged user.
USER pptruser

CMD ["node", "src/index.js"]
