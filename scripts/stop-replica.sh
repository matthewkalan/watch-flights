#!/bin/sh
ps -ef | grep watchflights | grep mongod | grep -v grep | awk '{print $2}' | xargs kill -9 $1