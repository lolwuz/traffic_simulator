import React, {Component} from 'react';
import './App.css';
import {
    Alert, Badge, Button,
    Card,
    CardBody, CardFooter,
    CardHeader, CardLink,
    CardText,
    CardTitle,
    Col,
    Container,
    Row
} from "reactstrap";

let test = {
    id: 1,
    phase: 'west_1',
    entries: ['A1', 'A2'],
    lights: [{
        light: "A1",
        status: "red",
        timer: 0.0
    }],
    mode: "normal"
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            controllers: [test],
            changes: []
        };

        this.onMode = this.onMode.bind(this)
    }

    componentDidMount() {
        this.timer = setInterval(() => this.getControllers(), 100)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        for (let x = 0; x < this.state.controllers.length; x++) {
            let isCurrent = false;
            for (let y = 0; y < prevState.controllers.length; y++) {
                if (prevState.controllers[y].id === this.state.controllers[x].id) {
                    isCurrent = true
                }
            }

            if (!isCurrent) {
                this.state.changes.unshift(this.state.controllers[x])
            }
        }

        if (this.state.changes.length > 5) {
            this.state.changes.pop()
        }
    }

    getControllers() {
        fetch('/info', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(r => r.json()).then(r => {
            let controllers = JSON.parse(r);

            this.setState({
                controllers: controllers
            });

        }).catch((err) => {
            console.log(err)
        });
    }

    postMode(controller) {
        fetch('/mode', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(controller)
        }).then(r => r.json()).then(r => {
            let controllers = JSON.parse(r);
        }).catch((err) => {
            console.log(err)
        });
    }

    onMode(controller, mode) {
        let controllers = JSON.parse(JSON.stringify(this.state.controllers));

        controller.mode = mode;

        this.postMode(controller);
    }

    render() {
        let controllers = this.state.controllers.map((controller, x) => {
            let entries = controller.entries.map((entry, y) => {
                return (
                    <Badge key={y} color="info" style={{marginRight: 4}}>{entry}</Badge>
                );
            });

            let lights = controller.lights.map((light, e) => {
                let timer = <Badge color="secondary">{light.timer}</Badge>;
                let color = "danger";

                switch (light.status) {
                    case "red":
                        color = "danger";
                        break;
                    case "orange":
                        color = "warning";
                        break;
                    case "green":
                        color = "success";
                        break;
                    default:
                        color = "danger";
                }

                return (
                    <Badge color={color} style={{marginRight: 4}}>{light.light}</Badge>
                );
            });

            let inverse = false;
            let color = "";


            let buttons;
            switch(controller.mode) {
                case "chaos":
                    inverse = true;
                    color = "danger";
                    buttons = (
                        <div>
                            <Button onClick={() => this.onMode(controller, "off")} color="success" size="sm" className="btn btn-light">
                                Turn off
                            </Button>{' '}
                            <Button onClick={() => this.onMode(controller, "normal")} size="sm" className="btn btn-light">Normal mode</Button>
                        </div>
                    );
                    break;
                case "off":
                    inverse = true;
                    color = "secondary";
                    buttons = (
                        <div>
                            <Button onClick={() => this.onMode(controller, "chaos")} color="danger" size="sm" className="btn btn-light">Chaos mode</Button>{' '}
                            <Button onClick={() => this.onMode(controller, "normal")} size="sm" className="btn btn-light">Normal mode</Button>
                        </div>
                    );
                    break;
                default:
                    inverse = false;
                    buttons = (
                        <div>
                            <Button onClick={() => this.onMode(controller, "off")} color="success" size="sm">
                                Turn off
                            </Button>{' '}
                            <Button onClick={() => this.onMode(controller, "chaos")} color="danger" size="sm">Chaos mode</Button>
                        </div>
                    );
                    break;
            }

            return (
                <Card inverse={inverse} color={color} key={x} style={{marginTop: 10}}>
                    <CardHeader>
                        <h5>Controller: {controller.id}</h5>
                    </CardHeader>
                    <CardBody>
                        <h6><b>Phase: </b>{controller.phase}</h6>
                        <p><b>Entries:</b> {entries}</p>
                        <p>{lights}</p>
                        { buttons }
                    </CardBody>
                </Card>
            );
        });

        let changes = this.state.changes.map(function (controller, i) {
            return (
                <Alert key={i} color="success" style={{marginTop: 10}}>
                    Controller: {controller.id} has connected
                </Alert>
            );
        });

        return (
            <div>
                <Container>
                    <Row>
                        <Col md={6}>
                            {controllers}
                        </Col>
                        <Col md={6}>
                            <Card style={{marginTop: 10}}>
                                <CardHeader>
                                    <h5>Status</h5>
                                </CardHeader>
                                <CardBody>
                                    <h6>Controllers: { this.state.controllers.length }</h6>
                                </CardBody>
                            </Card>
                            {changes}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
