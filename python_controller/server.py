#!/usr/bin/env python
from objects.controller import Controller
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json
import pandas
import time
try:
    import thread as thread  # For ubuntu thread
except ModuleNotFoundError:
    import _thread as thread  # Mac/Windows


_ADDRESS = "127.0.0.1"
clients = []
controllers = []
info_clients = []


def update():
    """ Updates the active controllers """
    while True:
        for controller in controllers:
            controller.update()

        for client in info_clients:
            update_info(client)

        time.sleep(0.2)


def update_info(client):
    """ Gives info about connected controllers to the info server """
    info = []

    for controller in controllers:
        lights = []
        waiting_times = []
        for light in controller.lights:
            lights.append(light.to_dict())

        for t in controller.waiting_times:
            diff = int(time.time() - t)
            waiting_times.append(diff)

        info.append({
            "entries": controller.entries,
            "waiting_times": waiting_times,
            "total_entries": controller.total_entries,
            "phase": controller.current_phase,
            "lights": lights,
            "mode": controller.mode,
            "client": controller.client.address
        })

    send_json = json.dumps(info)
    client.sendMessage(send_json)


def on_open():
    """ Starts update function on a new thread """
    thread.start_new_thread(update, ())


class SimpleServer(WebSocket):
    def handleConnected(self):
        """ A new client was added to the server """
        print(self.address[0])
        # if self.address[0] == _ADDRESS:
        #     print("info server has connected")
        #     info_clients.append(self)
        #     return

        print("client has connected: " + self.address[0])

        data_frame = pandas.read_csv('Intersects.csv', sep=";")
        matrix = data_frame.values
        traffic_lights = list(data_frame.columns.values)

        del traffic_lights[0]
        new_controller = Controller(self, traffic_lights, matrix)
        controllers.append(new_controller)

    def handleClose(self):
        """ A client has disconnected from the server """
        print("client disconnected: " + self.address[0])
        if self in info_clients:
            print("info server has disconnected")
            info_clients.remove(self)

        for controller in controllers:
            if controller.client == self:
                controllers.remove(controller)

        clients.remove(self)

    def handleMessage(self):
        """ Handles messages and json decoding """
        for client in info_clients:
            if client == self:
                json_data = json.loads(self.data)
                for controller in controllers:
                    if controller.client.address[0] == json_data["client"][0]:
                        controller.mode = json_data["mode"]

        for controller in controllers:
            if self == controller.client:
                # Make a entry to a existing controller
                entry_from_json = []
                try:
                    entry_from_json = json.loads(self.data)

                    for entry in entry_from_json:
                        if entry not in controller.light_names:
                            entry_from_json.remove(entry)
                            raise Exception(entry + ' value not in light names')

                    controller.entry(entry_from_json)
                except Exception as error:
                    pass
                    # self.sendMessage("Exception: " + repr(error))


if __name__ == "__main__":
    server = SimpleWebSocketServer('0.0.0.0', 8080, SimpleServer)
    on_open()
    server.serveforever()
