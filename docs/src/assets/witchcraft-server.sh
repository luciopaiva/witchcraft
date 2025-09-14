#!/bin/bash
# ~/start-server.sh
# Usage: ./start-server.sh start | stop | status

PORT=5743
SERVER_CMD="python3 -m http.server $PORT"
SERVER_DIR="$HOME/witchcraft-scripts"
LOG_FILE="/tmp/site-http.log"
PID_FILE="/tmp/site-http.pid"

start_server() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Server already running (PID $(cat $PID_FILE))"
    exit 0
  fi

  cd "$SERVER_DIR" || exit 1
  nohup $SERVER_CMD >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  echo "Server started (PID $(cat $PID_FILE))"
}

stop_server() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      rm -f "$PID_FILE"
      echo "Server (PID $PID) stopped"
    else
      echo "Stale PID file found, removing"
      rm -f "$PID_FILE"
    fi
  else
    echo "No PID file found. Server may not be running."
  fi
}

status_server() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Server is running (PID $(cat $PID_FILE))"
  else
    echo "Server is not running"
  fi
}

case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
