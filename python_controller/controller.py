from constants import MINIMUM_TIMES
import time
import random
import json
import operator


class Light:
    def __init__(self, name):
        self.name = name
        self.status = "red"  # Status: green, orange or red
        self.timer = 0   # Timer for traffic lights with a estimation timer
        self.last_green = int(time.time())
        self.minimum_time = MINIMUM_TIMES[name[0]]  # The lights minimum green Time

    def to_dict(self):
        return {"name": self.name, "status": self.status, "timer": self.timer}

    def set_timer(self, timer):
        self.timer = timer

    def is_allowed_to_change(self):
        """ Check time if the light is allowed to change """
        time_difference = int(time.time() - self.last_green)
        return time_difference >= self.minimum_time


class Controller:
    def __init__(self, server, client, traffic_lights, intersections):
        """
        Controller
        :param traffic_lights: list of traffic_light names
        :param intersections: 2d numpy array of intersections
        """
        self.server = server
        self.client = client
        self.light_names = traffic_lights
        self.intersections = intersections
        self.entries = []
        self.lights = []

        self.start()  # Set defaults for this controller

    def start(self):
        """
        Turn all lights to red
        :return:
        """
        for name in self.light_names:
            self.lights.append(Light(name))

        self.send()

    def send(self):
        """ Serialize list of lights to JSON and send """
        dict_array = []

        for light in self.lights:
            dict_array.append(light.to_dict())

        send_json = json.dumps(dict_array)

        # if statement for debuggingm n
        if self.client["id"] == 0:
            print(send_json)
        else:
            self.server.send_message(self.client, send_json)

    def entry(self, entries):
        """
        A new road user has entered the simulation
        :param entries: list of entered users
        """
        for entry in entries:
            for light in self.lights:
                if entry["light"] == light.name:
                    if light not in self.entries:
                        self.entries.append(light)
                        print(light)

    def is_intersecting(self, light_one, light_two):
        light_index = self.light_names.index(light_one)
        entry_index = self.light_names.index(light_two)

        intersect = self.intersections[light_index + 1][entry_index]

        return intersect == '1'

    def get_lights(self):
        handled_entries = self.entries.copy()

        green_lights = []
        orange_lights = []
        red_lights = []

        # Check for every entry

        for entry_one in handled_entries:
            for entry_two in handled_entries:
                if self.is_intersecting(entry_one.name, entry_two.name):
                    handled_entries.remove(entry_two)

        # Handle entries
        for light in self.lights:
            if light in handled_entries:
                light.status = "green"
                light.last_green = int(time.time())
                green_lights.append(light)
            else:
                light.status = "red"
                light.last_green = int(time.time())
                red_lights.append(light)

        return green_lights + orange_lights + red_lights

    def update(self):
        lights = self.get_lights()

        self.lights = lights
        self.send()




