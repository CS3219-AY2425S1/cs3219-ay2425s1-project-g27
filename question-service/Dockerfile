FROM node:20

# Create a non-privileged user
RUN useradd -ms /bin/sh -u 1001 app

# Switch to the non-privileged user
USER app

WORKDIR /app

COPY --chown=app:app package.json package-lock.json ./

RUN npm install

# Copy the rest of the application code
COPY --chown=app:app . /app

EXPOSE 3002

CMD ["npm", "run", "dev"]