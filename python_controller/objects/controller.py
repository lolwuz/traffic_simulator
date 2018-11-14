import time
from constants import MINIMUM_TIMES, _PHASES
from objects.light import Light
import json


class Controller:
    def __init__(self, server, client, traffic_lights, intersections):
        """
        Controller
        :param traffic_lights: list of traffic_light names
        :param intersections: 2d numpy array of intersections
        """
        self.server = server
        self.client = client
        self.last_send = dict()
        self.light_names = traffic_lights
        self.intersections = intersections
        self.entries = []
        self.lights = []
        self.phases = _PHASES
        # Logging
        self.current_phase = ""
        self.total_entries = 0

        self.start()  # Set defaults for this controller

    def start(self):
        """
        Turn all lights to red
        :return:
        """
        for name in self.light_names:
            self.lights.append(Light(name))

        # Build phases
        for key in self.phases:
            self.phases[key] = self.get_complete_phase(self.phases[key])

        self.send()

    def send(self):
        """ Serialize list of lights to JSON and send """
        dict_array = []

        for light in self.lights:
            dict_array.append(light.to_dict())

        if dict_array != self.last_send:  # Only send when lights have changed
            self.last_send = dict_array
            send_json = json.dumps(dict_array)

            if self.client["id"] == 0:  # Debug
                pass
                # self.server.send_message_to_all(send_json)
            else:
                self.server.send_message(self.client, send_json)

    def entry(self, entries):
        """
        Called from the server when a new road user has entered the simulation
        :param entries: List of entered users
        """
        for name in entries:
            if name not in self.entries:
                self.entries.append(name)

        for light in self.lights:
            if light.status == "green" and light.name in self.entries:
                self.entries.remove(light.name)

    def is_intersecting(self, light_one, light_two):
        """
        Determines if lights are intersecting
        :param light_one: Light name
        :param light_two: Light name
        :return: A boolean if intersect between lights is found
        """
        light_index = self.light_names.index(light_one)
        entry_index = self.light_names.index(light_two)
        intersect = self.intersections[light_index][entry_index + 1]

        return intersect == '1'

    def get_complete_phase(self, phase):
        """
        Determines what lights are allowed in this phase
        :param phase: Phase lights
        :return: A list of lights
        """
        intersecting_lights = []  # Lights that cannot be used in this phase
        for phase_light in phase:
            for light in self.light_names:
                if self.is_intersecting(phase_light, light):
                    intersecting_lights.append(light)

        for light in self.light_names:
            if light not in intersecting_lights and light not in phase:
                if light[0] != "A":  # Add no driving lane
                    phase.append(light)  # Light is not intersecting so it can be added to the phase

        return phase

    def get_best_phase(self):
        """
        Checks for every phase what scores it get according to:
            - Most matched entries with lights in phase
            - How long entries have been waiting
            - Is there a train inbound (switch to best phase without E1)
        :return: Key of best phase and score
        """
        best_phase = ["A_1", 0]

        for key in self.phases:
            phase = self.phases[key]
            score = 0
            for entry in self.entries:
                if entry in phase:
                    waiting_factor = self.get_waiting_factor(entry)
                    score += 1
                    score += waiting_factor
            if score > best_phase[1]:
                best_phase = [key, score]

        return best_phase

    def get_waiting_factor(self, name):
        """ Calculates a factor based on waiting time """
        light = self.get_light(name)
        difference = time.time() - light.last_green
        factor = round(difference / 20)

        if name == "D1":  # Bus factor is higher
            factor *= 2

        if name == "E1":
            factor = 1000

        return factor

    def get_light(self, name):
        """
        Returns the correct light from the lights list
        :param name:
        :return: light
        """
        return_light = None
        for light in self.lights:
            if light.name == name:
                return_light = light

        return return_light

    def initialize_phase(self, phase_name):
        """
        Check if the lights can change and switch lights
        :param phase_name: name of the phase
        """
        for light in self.lights:
            if not light.is_allowed_to_change():
                return

        self.current_phase = phase_name
        phase = self.phases[phase_name]
        for name in self.light_names:
            light = self.get_light(name)
            if name in phase:
                light.switch_status("green")
            else:
                light.switch_status("red")

    def update(self):
        best_phase = self.get_best_phase()

        self.initialize_phase(best_phase[0])

        for light in self.lights:
            light.update()

            if light.status == "green" and light.name in self.entries:
                self.entries.remove(light.name)

        self.send()



