FROM node:24-alpine
WORKDIR /app
ENV AEROSCOPE_HOSTED=1
COPY server.mjs gemini.mjs ./
COPY dist/defect-guide.mjs ./dist/
USER node
EXPOSE 8765
CMD ["node", "server.mjs"]
