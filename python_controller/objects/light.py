import time


class Light:
    def __init__(self, name, margin):
        self.name = name
        self.margin = margin
        self.status = "red"  # Status: green, orange or red
        self.new_status = ""
        self.timer = 0  # Timer for traffic lights with a estimation timer
        self.last_green = time.time()
        self.minimum_time = 20.0  # The lights minimum green Time
        self.next_change = float('inf')

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
        self.next_change = time.time()

        if self.new_status == "green":
            self.next_change = time.time() + self.margin
            self.last_green = time.time()

        if self.new_status == "red":
            if self.name[0] == "A":
                self.status = "orange"
                self.next_change += 3

    def update(self):
        """ Update """
        if self.next_change <= time.time():
            self.status = self.new_status


