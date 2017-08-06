#!/usr/bin/env bash

PID=`pgrep -f witchcraft`

if [ -z ${PID} ]; then
    echo "Witchcraft server process not found"
    exit 0
fi

kill -9 ${PID}
echo "Process ${PID} killed"
