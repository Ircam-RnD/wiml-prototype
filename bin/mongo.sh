#!/bin/bash

mongod --dbpath ./data/db & MONGO_PID=$!
node ./bin/scripts --watch & NODE_PID=$!

trap clean_exit SIGINT

function clean_exit() {
	echo "CTRL-C caught"
	kill $MONGO_PID
	exit 0
}

while true;
do :
done

