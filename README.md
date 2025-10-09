# rpl_campus-virtual
## Antes de instalar las dependencias, entrar a la carpeta campus-virtual
cd campus-virtual
## El archivo .env se elimina siempre se debe agregar
## y poner:
DATABASE_URL="file:./dev.db"
## Comando para instalar las dependecias:
npm install
## Comando para sincronizar la BD
npm run prisma:generate
## Comandos Para ejecutar la app:                       
npm run dev
## En otra terminal en la carpeta campus-virtual ejecutar este comando para los tests
npm run test
