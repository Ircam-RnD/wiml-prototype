# XMM Server - Interactive machine learning web service prototype, based on XMM library by Jules Françoise and Node framweork

Dependencies :
--------------

- Clone this repository
- Install Node
- Install [MongoDB](https://docs.mongodb.org/manual/installation/)
- Clone [mongo-c-driver](https://github.com/mongodb/mongo-c-driver)
- Clone Jules Françoise's [XMM lib](https://github.com/JulesFrancoise/xmm)

Compilation & Installation :
----------------------------

- Install mongo-c-driver : go to your mongo-c-driver local repository, switch to branch r1.3, then follow instructions in the README to build and install libmongoc and libbson
- Go into this project's root folder and type npm install to install the dependencies listed in package.json
- Create a symlink to your xmm local repository in ./ml-tools/dependencies folder (or copy it there)
- Go into ./ml-tools/xmm-server-tool, open xmm-server-tool xcode project, then build it (this installs the binary into ./bin)
- Type "npm run watch" to start the server

The project is self-contained, you can now move it wherever you want.