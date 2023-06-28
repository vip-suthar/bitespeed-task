# To run this project

clone the github repo [here](https://github.com/vip-suthar/bitespeed-task) and run locally by installing the required dependency, run the following command at the root of the project

    > npm install
    > npm start

ENVIROMENT VARIABLES Required for local

    NODE_PORT=<PORT for NodeJS server, default will be 8000>
    DB_HOST=<HOST>
    DB_NAME=<Name of DB>
    DB_USER=<Username of DB>
    DB_PASSWORD=<Password of DB>
    DB_PORT=<PORT for DB>

> P.S - To use locally make sure to install postgresql and put the .env at the root of the project.

## To use the api

- URL :- [https://bitespeed-task.vercel.app/identify](https://bitespeed-task.vercel.app/identify)
- Type :- POST
- Body:

      {
        "email": string | null,
        "phoneNumber": string | null
      }
