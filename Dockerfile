FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv libgomp1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN python3 -m venv /opt/pyvenv \
  && /opt/pyvenv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/pyvenv/bin/pip install --no-cache-dir -r ml/requirements.txt

ENV NODE_ENV=production \
    PYTHON_BIN=/opt/pyvenv/bin/python \
    PATH="/opt/pyvenv/bin:${PATH}"

CMD ["npm", "start"]
