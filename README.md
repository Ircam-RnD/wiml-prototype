# WIML Server

## Web Interactive Machine Learning service prototype, based on XMM library by Jules Françoise, and parts of [Collective Soundworks](https://github.com/collective-soundworks) and [WavesJS](https://github.com/wavesjs)

## Requirements :

- Clone this repository
- Install NodeJS
- Install [MongoDB](https://docs.mongodb.org/manual/installation/)
- Clone [mongo-c-driver](https://github.com/mongodb/mongo-c-driver)
- Clone Jules Françoise's [XMM lib](https://github.com/JulesFrancoise/xmm)

## Compilation & Installation :

- Install mongo-c-driver : go to your mongo-c-driver local repository, switch to branch r1.3 : `git checkout r1.3`, then follow instructions in the README to build and install libmongoc and libbson
- Go into this project's root folder and type `npm install` to install the dependencies listed in `package.json`
- Create a symlink to your xmm local repository in `./ml-tools/dependencies` folder (or copy it there)
- Go into `./ml-tools/xmm-server-tool`, open xmm-server-tool xcode project, then build it (this installs the binary into ./bin)

## Usage :

Type `npm run mongo` from the project's root folder to start the server and mongodb  
(does the same as `mongod --dbpath ./data/db` then `npm run watch`, but automatically kills mongod on `CTRL-C`)

From a smartphone or any other similar device equipped with sensors, visit :  
`http://YOUR.IP.ADDRESS.HERE:3000/wiml-client`  
You can now record phrases (sensor data time series), send them to the database tagged with labels, and load the model trained with these phrases from the server in real-time

## Notes :

Only tested with OSX 10.11 and Node v0.12 for now