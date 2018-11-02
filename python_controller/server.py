#!/usr/bin/env python
from controller import Controller
import json
import websocket
import _thread as thread
import pandas
import time


class Socket:
    def __init__(self):
        websocket.enableTrace(True)
        data_frame = pandas.read_csv('intersects.csv', sep=";")
        matrix = data_frame.values

        traffic_lights = list(data_frame.columns.values)

        self.socket = websocket.WebSocketApp("ws://127.0.0.1:5678/",
                                             on_message=self.on_message,
                                             on_error=self.on_error,
                                             on_close=self.on_close)
        self.controller = Controller(traffic_lights, matrix)
        self.start_time = time.time()

        self.start()

    def start(self):
        self.socket.on_open = self.on_open
        self.socket.run_forever()

    def update(self):
        print("UPDATE")
        self.controller.update(self.socket)

        # Eat, sleap, rave, repeat
        time.sleep(1.0 - ((time.time() - self.start_time) % 1.0))
        self.update()

    def on_message(self, message):
        # Decode JSON to Python Object
        print(message)
        entry_from_json = message  # json.load(message)
        self.controller.entry(entry_from_json)

    def on_error(self, error):
        print(error)

    def on_close(self):
        print("### closed ###")

    def on_open(self):
        def run(*args):
            for i in range(30):
                time.sleep(1)
                self.socket.send("Hello %d" % i)
            time.sleep(1)
            self.socket.close()

        thread.start_new_thread(run, ())
        thread.start_new_thread(self.update, ())


if __name__ == "__main__":
    socket = Socket()
