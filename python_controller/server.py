#!/usr/bin/env python
import random

from controller import Controller
from websocket_server import WebsocketServer
import json
import logging
import _thread as thread
import pandas
import time


class Server:
    def __init__(self):
        self.controllers = []
        self.server = WebsocketServer(8080, host='127.0.0.1', loglevel=logging.INFO)
        self.server.set_fn_new_client(self.new_client)
        self.server.set_fn_client_left(self.client_left)
        self.server.set_fn_message_received(self.on_message)

        # Fake simulation
        self.on_open()

        self.server.run_forever()

    def new_client(self, client):
        """ A new client was added to the server """
        data_frame = pandas.read_csv('intersects.csv', sep=";")
        matrix = data_frame.values
        traffic_lights = list(data_frame.columns.values)

        new_controller = Controller(server, client, traffic_lights, matrix)
        self.controllers.append(new_controller)

    def client_left(self, client):
        """ A client has disconnected from the server """
        for controller in self.controllers:
            if client["id"] == controller.client["id"]:
                self.controllers.remove(controller)

    def on_message(self, client, server, message):
        # Select the right controller
        for controller in self.controllers:
            if client["id"] == controller.client["id"]:
                # Make a entry to a existing controller
                entry_from_json = []
                try:
                    entry_from_json = json.load(message)
                except:
                    logging.DEBUG("Not of type JSON")
                controller.entry(entry_from_json)

    def update(self):
        time.sleep(1)
        for controller in self.controllers:
            controller.update()

        self.update()

    def on_open(self):
        def run(*args):
            data_frame = pandas.read_csv('intersects.csv', sep=";")
            matrix = data_frame.values
            traffic_lights = list(data_frame.columns.values)
            client = {"id": 0}
            test_controller = Controller(self.server, client, traffic_lights, matrix)
            self.controllers.append(test_controller)

            while True:
                time.sleep(1)

                random_light = random.choice(traffic_lights)
                test_controller.entry([{"light": random_light, "time": time.time()}])

            time.sleep(1)
            self.server.close()

        thread.start_new_thread(run, ())
        thread.start_new_thread(self.update, ())


if __name__ == "__main__":
    server = Server()
