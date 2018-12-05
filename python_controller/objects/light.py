import time


class Light:
    def __init__(self, name, margin):
        self.name = name
        self.margin = margin
        self.status = "red"  # Status: green, orange or red
        self.new_status = ""
        self.timer = 0  # Timer for traffic lights with a estimation timer
        self.last_green = time.time()
        self.minimum_time = 10.0  # The lights minimum green Time
        self.next_switch = float('inf')

    def to_dict(self) -> dict:
        """ Returns a dict representation of the light object """
        return {"light": self.name, "status": self.status, "timer": self.timer}

    def is_allowed_to_change(self) -> bool:
        """ Check time if the light is allowed to change """
        green_difference = time.time() - self.last_green
        return green_difference >= self.minimum_time

    def switch_status(self, new_status):
        """ Switches the status of the light """
        if self.status == new_status or not self.is_allowed_to_change() or new_status == self.new_status:  # Do nothing
            return

        self.new_status = new_status
        self.next_switch = time.time() + 3

        if new_status == "green":
            self.next_switch += 3  # Delay of 3 seconds to save bikers and pedestrians from imminent death
            if self.name[0] == "A":
                self.last_green = time.time()

        if new_status == "red":
            if self.name[0] == "A":  # Light is about to change
                self.status = "orange"  # Status is now orange

    def update(self):
        """ Update """
        if self.next_switch < time.time():
            self.status = self.new_status
