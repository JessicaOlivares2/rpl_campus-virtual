# rpl_campus-virtual
## Antes de instalar las dependencias, entrar a la carpeta campus-virtual
cd campus-virtual
## El archivo .env se elimina siempre se debe agregar
## y poner:
DATABASE_URL="file:./dev.db"
## Instalar pytes si no esta descargado (Esto es necesario para ejecutar los tests de código de los alumnos)
pip install pytest
## Comando para instalar las dependecias:
npm install
## Comando para sincronizar la BD
npm run prisma:generate
## Comandos Para ejecutar la pagina:                       
npm run dev
## En otra terminal en la carpeta campus-virtual ejecutar este comando para los tests
npm run test
# Documentación Completa del proyecto:
## link: https://docs.google.com/document/d/1kNdclwI1PVPN0AuyIAwiSmyhNGiPmSYSwM68KjeT9lQ/edit?usp=sharing 
