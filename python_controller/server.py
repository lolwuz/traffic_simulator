#!/usr/bin/env python
import os
import random
from objects.controller import Controller
from websocket_server import WebsocketServer
import json
import pandas
import time
import requests

try:
    import thread as thread  # For ubuntu thread
except ModuleNotFoundError:
    import _thread as thread


class Server:
    _ADDRESS = "127.0.0.1"

    def __init__(self):
        self.controllers = []
        self.server = WebsocketServer(8080, host='0.0.0.0')
        self.server.set_fn_new_client(self.new_client)
        self.server.set_fn_client_left(self.client_left)
        self.server.set_fn_message_received(self.on_message)
        self.is_info_server = False
        self.info_client = None

        self.on_open()

        self.server.run_forever()

    def new_client(self, client, server):
        """ A new client was added to the server """
        print(client["address"])
        if client["address"][0] == self._ADDRESS:
            print("info server has connected")
            self.is_info_server = True
            self.info_client = client
            return

        print("client has connected")
        print(server)

        data_frame = pandas.read_csv('Intersects.csv', sep=";")
        matrix = data_frame.values
        traffic_lights = list(data_frame.columns.values)
        del traffic_lights[0]

        new_controller = Controller(server, client, traffic_lights, matrix)
        self.controllers.append(new_controller)

    def client_left(self, client, server):
        """ A client has disconnected from the server """
        print (client["address"][0])
        if client["address"][0] == self._ADDRESS:
            print("info server has disconnected")
            self.is_info_server = False
            self.info_client = None
            return

        print("client: " + str(client["id"]) + " disconnected")
        for controller in self.controllers:
            if client["id"] == controller.client["id"]:
                self.controllers.remove(controller)

    def on_message(self, client, server, message):
        """ Handles messages and json decoding """
        for controller in self.controllers:
            if client["id"] == controller.client["id"]:
                # Make a entry to a existing controller
                entry_from_json = []
                try:
                    entry_from_json = json.loads(message)
                except:
                    print(message)
                    self.server.send_message(client, "IKKE NIET SNAPPE DIKKE ERROR OEPSIE")

                controller.entry(entry_from_json)

    def update(self):
        """ Updates the active controllers """
        while True:
            for controller in self.controllers:
                controller.update()

            if self.is_info_server:
                self.update_info()

            time.sleep(0.2)

    def update_info(self):
        info = []

        for controller in self.controllers:
            lights = []
            for light in controller.lights:
                lights.append(light.to_dict())

            info.append({
                "id": controller.client["id"],
                "entries": controller.entries,
                "total_entries": controller.total_entries,
                "phase": controller.current_phase,
                "lights": lights
            })

        send_json = json.dumps(info)

        self.server.send_message(self.info_client, send_json)

    def on_open(self):
        thread.start_new_thread(self.update, ())


if __name__ == "__main__":
    server = Server()
