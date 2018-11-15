import React, {Component} from 'react';
import './App.css';
import {
    Alert,
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle,
    Col,
    Container,
    Row
} from "reactstrap";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            controllers: [],
            changes: []
        };
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.getControllers(), 100)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        for(let x = 0; x < this.state.controllers.length; x++) {
            let isCurrent = false;
            for(let y = 0; y < prevState.controllers.length; y++) {
                if(prevState.controllers[y].id === this.state.controllers[x].id) {
                    isCurrent = true
                }
            }

            if (!isCurrent) {
                this.state.changes.unshift(this.state.controllers[x])
            }
        }

        if(this.state.changes.length > 5) {
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
            console.log(r);
            this.setState({
                controllers: JSON.parse(r)
            });
        }).catch((err) => {
            console.log(err)
        });
    }

    render() {
        let controllers = this.state.controllers.map(function(controller, i){
            return (
                <Card>
                    <CardHeader>Controller: { controller.id }</CardHeader>
                    <CardBody>
                        <CardTitle>Current Phase { controller.phase }</CardTitle>
                        <CardText>{ controller.entries }</CardText>
                    </CardBody>
                </Card>
            );
        });

        let changes = this.state.changes.map(function(controller, i){
            return (
                <Alert key={i} color="success">
                    Controller: { controller.id } has connected
                </Alert>
            );
        });

        return (
            <div>
                <Container>
                    <Row>
                        <Col>
                            { controllers }
                        </Col>
                        <Col>
                            {  changes }
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
