#!/usr/bin/env python
import os
import random

from objects.controller import Controller
from websocket_server import WebsocketServer
import json
import logging
import pandas
import time
import requests
try:
    import thread as thread  # For ubuntu thread
except ModuleNotFoundError:
    import _thread as thread


class Server:
    def __init__(self):
        self.controllers = []
        self.server = WebsocketServer(8080, host='0.0.0.0')
        self.server.set_fn_new_client(self.new_client)
        self.server.set_fn_client_left(self.client_left)
        self.server.set_fn_message_received(self.on_message)

        # Fake simulation
        self.on_open()

        self.server.run_forever()

    def new_client(self, client, server):
        """ A new client was added to the server """
        logging.info("client: " + str(client["id"]) + " has connected")

        data_frame = pandas.read_csv('Intersects.csv', sep=";")
        matrix = data_frame.values
        traffic_lights = list(data_frame.columns.values)
        del traffic_lights[0]

        new_controller = Controller(server, client, traffic_lights, matrix)
        self.controllers.append(new_controller)

        geo_data = requests.get("http://ip-api.com/json/" + new_controller.client["address"][0])
        geo_json = geo_data.json()

        print(geo_json)

        filename = "users.json"
        with open(filename, 'r') as f:
            data = json.load(f)
            data.append(geo_json)

        os.remove(filename)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)

        for controller in self.controllers:
            print("--------------------------------------------")
            print(controller.client)
            print("current_phase: " + controller.current_phase)
            print("waiting: " + str(controller.entries))

    def client_left(self, client, server):
        """ A client has disconnected from the server """
        logging.info("client: " + str(client["id"]) + " has disconnected")
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
                    entry_from_json = json.loads(message)
                except:
                    print(message)
                    logging.DEBUG("Not of type JSON")

                controller.entry(entry_from_json)

    def update(self):
        while True:
            for controller in self.controllers:
                controller.update()

            time.sleep(0.2)

    def on_open(self):
        def run(*args):
            data_frame = pandas.read_csv('Intersects.csv', sep=";")
            matrix = data_frame.values

            traffic_lights = list(data_frame.columns.values)
            del traffic_lights[0]
            client = {"id": 0}
            test_controller = Controller(self.server, client, traffic_lights, matrix)
            self.controllers.append(test_controller)

            while True:
                time.sleep(1)

                random_light = random.choice(traffic_lights)
                test_controller.entry([random_light])

            time.sleep(1)
            self.server.close()

        # thread.start_new_thread(run, ())
        thread.start_new_thread(self.update, ())


if __name__ == "__main__":
    server = Server()
