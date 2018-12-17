import time
from constants import MINIMUM_TIMES, _PHASES, MARGINS
from objects.light import Light
import json


class Controller:
    def __init__(self, client, traffic_lights, intersections):
        """
        Controller
        :param traffic_lights: list of traffic_light names
        :param intersections: 2d numpy array of intersections
        """
        self.client = client
        self.last_send = dict()
        self.light_names = traffic_lights
        self.intersections = intersections
        self.entries = []
        self.waiting_times = []
        self.lights = []
        self.phases = _PHASES

        self.current_phase = ""
        self.total_entries = 0
        self.mode = "normal"

        self.start()  # Set defaults for this controller

    def start(self):
        """
        Set defaults for this controller
        :return:
        """

        print(self.light_names)
        for name in self.light_names:
            self.lights.append(Light(name, MARGINS[name]))

        # Build phases
        for key in self.phases:
            self.phases[key] = self.get_complete_phase(self.phases[key])

        print("phases")
        print(self.phases)
        self.send()

    def send(self):
        """ Serialize list of lights to JSON and send """
        dict_array = []

        for light in self.lights:
            dict_array.append(light.to_dict())

        if dict_array != self.last_send:  # Only send when lights have changed
            self.last_send = dict_array
            send_json = json.dumps(dict_array)

            self.client.sendMessage(send_json)

    def entry(self, entries):
        """
        Called from the server when a new road user has entered the simulation
        :param entries: List of entered users
        """
        for name in entries:
            if name not in self.entries:
                self.entries.append(name)
                self.waiting_times.append(time.time())
                self.total_entries += 1

        for light in self.lights:
            if light.status == "green" and light.name in self.entries:
                index = self.entries.index(light.name)
                del self.waiting_times[index]
                self.entries.remove(light.name)

    def is_intersecting(self, light_one, light_two) -> bool:
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

    def get_complete_phase(self, phase) -> str:
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

    def get_best_phase(self) -> list:
        """
        Checks for every phase what scores it get according to:
            - Most matched entries with lights in phase
            - How long entries have been waiting
            - Is there a train inbound (switch to best phase without F1/2)
        :return: Key of best phase and score in a list
        """
        best_phase = ["A_NORTH", 0]

        for key in self.phases:
            phase = self.phases[key]
            score = 0
            for entry in self.entries:
                if entry in phase:
                    waiting_factor = self.get_waiting_factor(entry)
                    score += 10
                    score += 10 ** waiting_factor
            if score > best_phase[1]:
                best_phase = [key, score]

        return best_phase

    def get_waiting_factor(self, name) -> int:
        """ Calculates a factor based on waiting time """
        index = self.entries.index(name)

        diff = int(time.time() - self.waiting_times[index])
        factor = round(diff / 20)

        if name == "D1":  # Bus factor is higher
            factor = 4

        if name in ["F1", "F2"]:
            factor = 10

        return factor

    def get_light(self, name) -> Light:
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

    def initialize_mode(self):
        """ Starts a special mode when Controller.mode is not 'normal' """
        phase = []
        if self.mode == "chaos":
            phase = self.light_names

        for name in self.light_names:
            light = self.get_light(name)
            if name in phase:
                light.switch_status("green")
            else:
                light.switch_status("red")

    def update(self):
        """ Check for changes """
        best_phase = self.get_best_phase()

        if self.mode == "normal":
            self.initialize_phase(best_phase[0])
        else:
            self.initialize_mode()

        for light in self.lights:
            light.update()

            if light.status == "green" and light.name in self.entries:
                index = self.entries.index(light.name)
                del self.waiting_times[index]
                self.entries.remove(light.name)

        self.send()



