import React, {Component} from 'react';
import './App.css';
import {
    Alert,
    Badge, Button,
    Card,
    CardBody,
    CardHeader,
    Col, Collapse,
    Container, DropdownItem,
    DropdownMenu, DropdownToggle,
    Jumbotron,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem,
    Row, UncontrolledDropdown
} from "reactstrap";
import InfoModal from "./components/InfoModal";

let test = {
    id: 1,
    phase: 'west_1',
    entries: ['A1', 'A2'],
    lights: [{
        light: "A1",
        status: "red",
        timer: 0.0
    }],
    mode: "normal",
    client: {
        ip: "217.19.25.11",
        port: "1337"
    }
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,
            controllers: [test, test],
            changes: []
        };

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.onMode = this.onMode.bind(this);
        this.allMode = this.allMode.bind(this);
    }

    componentDidMount() {
        this.timer = setInterval(() => this.getControllers(), 100);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        for (let x = 0; x < this.state.controllers.length; x++) {
            let isCurrent = false;
            for (let y = 0; y < prevState.controllers.length; y++) {
                if (prevState.controllers[y].id === this.state.controllers[x].id) {
                    isCurrent = true;               }
            }

            if (!isCurrent) {
                this.state.changes.unshift(this.state.controllers[x]);
            }
        }

        if (this.state.changes.length > 5) {
            this.state.changes.pop();
        }
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
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
            console.log(err);
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
            console.log(err);
        });
    }

    allMode(mode) {
        for(let i = 0; i < this.state.controllers.length; i++) {
            let controller = this.state.controllers[i];

            this.onMode(controller, mode)
        }
     }

    onMode(controller, mode) {
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
                <Card inverse={inverse} color={color} key={x} style={{marginTop: 20}}>
                    <CardHeader className="bg-info" >
                        <Row>
                            <Col>
                                <h4 className="text-light">{controller.client.ip}:{controller.client.port}</h4>
                            </Col>
                            <Col>
                                <InfoModal ip={controller.client.ip}/>
                            </Col>
                        </Row>
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
                <Alert key={i} color="success" style={{marginTop: 20}}>
                    Controller: {controller.id} has connected
                </Alert>
            );
        });

        if (this.state.controllers.length < 1) {
            return (
                <div>
                    <Jumbotron>
                        <h1 className="display-3">No simulations connected</h1>
                        <p className="lead">The controller at this location is currently not controlling any traffic simulations</p>
                        <hr className="my-2" />
                        <p>You can open a new simulation by pressing the button below</p>
                        <p className="lead">
                            <Button color="primary">Open a new simulation</Button>
                        </p>
                    </Jumbotron>
                </div>
            )
        }

        return (
            <div>
                <Navbar color="info" expand="md">
                    <NavbarBrand href="/" className="mr-auto text-light">TRAFFIC CONTROLLER</NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <Collapse isOpen={this.state.collapsed} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <Button size="xl" className="btn-outline-light" onClick={() => this.allMode("chaos")}>Full chaos</Button>
                            </NavItem>
                            <NavItem style={{marginLeft: 10}}>
                                <Button className="btn-outline-light" onClick={() => this.allMode("off")}>All off</Button>
                            </NavItem>

                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle className="text-light" nav caret>
                                    Status
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem>
                                        { this.state.controllers.length } controller(s) connected
                                    </DropdownItem>
                                    <DropdownItem>
                                        {  }
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem>
                                        Reset
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Nav>
                    </Collapse>
                </Navbar>

                <Container fluid>
                    <Row>
                        <Col md={6}>
                            {controllers}
                        </Col>
                        <Col md={6}>
                            {changes}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
