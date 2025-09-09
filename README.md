# rpl_campus-virtual
## Comando para instalar las dependecias:
npm install
## el archivo .env se elimina siempre se debe agregar
## y poner:
DATABASE_URL="file:./dev.db"
## Comando para sincronizar la BD
npm run prisma:generate
## Comandos Para ejecutar la app:                       
npm run dev
## Comando para ejecutar tests
npm run test
