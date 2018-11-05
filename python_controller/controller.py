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
        self.last_green = time.time()
        self.minimum_time = MINIMUM_TIMES[name[0]]  # The lights minimum green Time

    def to_dict(self):
        return {"name": self.name, "status": self.status, "timer": self.timer}

    def set_timer(self, timer):
        self.timer = timer

    def is_allowed_to_change(self):
        """ Check time if the light is allowed to change """
        time_difference = time.time() - self.last_green
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
            self.server.send_message_to_all(send_json)
        else:
            pass
            # self.server.send_message(self.client, send_json)

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

    def is_intersecting(self, light_one, light_two):
        light_index = self.light_names.index(light_one)
        entry_index = self.light_names.index(light_two)

        intersect = self.intersections[light_index][entry_index + 1]

        return intersect == '1'

    def get_lights(self):
        is_changed = False
        handled_entries = self.entries.copy()

        # handled_entries.sort(key=lambda x: x.last_green, reverse=False)

        print(self.entries)

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
                if light.status == "red":
                    is_changed = True

                light.status = "green"
                green_lights.append(light)
            else:
                if light.status == "green":
                    is_changed = True

                light.status = "red"
                red_lights.append(light)

        return (green_lights + orange_lights + red_lights), is_changed

    def update(self):
        new_lights, is_changed = self.get_lights()

        if is_changed:
            # Check if allowed to change
            for light in new_lights:
                if light.status == "green":
                    if not light.is_allowed_to_change():
                        return
                    else:
                        for entry in self.entries:
                            if entry is light:
                                light.last_green = time.time()
                                self.entries.remove(entry)
            self.send()





