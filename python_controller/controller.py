import time
import random
import json


class Controller:
    def __init__(self, traffic_lights, intersections):
        """
        Controller
        :param traffic_lights: list of traffic_light names
        :param intersections: 2d numpy array of intersections
        """
        self.traffic_lights = traffic_lights
        self.intersections = intersections
        self.entries = []

        print(traffic_lights[1])

    def entry(self, entry):
        """
        A new road user has entered the simulation
        :param entry: list of entered users
        :return:
        """
        random_light = random.choice(self.traffic_lights)
        if random_light not in self.entries:
            self.entries.append({"light": random_light, "time": time.time()})

    def update(self, socket):
        waiting_lights = []
        for entry in self.entries:
            waiting_lights.append(entry["light"])
        possible_lights = waiting_lights.copy()
        impossible_lights = []

        for light in waiting_lights:
            current_index = self.traffic_lights.index(light)

            for next_light in waiting_lights:
                next_index = self.traffic_lights.index(next_light)
                intersect = self.intersections[next_index][current_index]
                if intersect == "1":
                    if next_light in possible_lights:
                        possible_lights.remove(next_light)

                    if next_light not in impossible_lights:
                        impossible_lights.append(next_light)
                elif intersect == "x":
                    if next_light in possible_lights:
                        possible_lights.remove(next_light)

        send_array = []
        for light in possible_lights:
            send_array.append({"light": light, "status": "green", "timer": 0})

        for light in impossible_lights:
            send_array.append({"light": light, "status": "red", "timer": 0})

        send_json = json.dumps(send_array)
        print(send_json)

        # send json
        socket.send(send_json)