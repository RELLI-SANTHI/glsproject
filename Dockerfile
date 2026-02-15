# Fase di build: usa un'immagine Node.js per costruire l'app Angular
FROM node:20.12.2 AS build-env

# Crea e imposta la directory di lavoro per il progetto
WORKDIR /app

# Copia il package.json e il package-lock.json per installare le dipendenze
COPY gls.eva.frontend-develop/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il codice sorgente nell'immagine Docker
COPY gls.eva.frontend-develop .

# Esegui il postinstall per installare le dipendenze
RUN npm run postinstall

# Esegui la build dell'app Angular
RUN npm run build --prod

# Fase di runtime: usa Nginx per servire l'applicazione Angular
FROM nginx:1.21-alpine

# Copia i file generati dalla build nell'immagine Nginx
COPY --from=build-env /app/dist/gls-eva-frontend /usr/share/nginx/html

# Espone la porta 80 (porta di default di Nginx)
EXPOSE 80

# Avvia il server Nginx
CMD ["nginx", "-g", "daemon off;"]
