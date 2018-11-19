import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class InfoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            ipInfo: {
                status: "success",
                country: "COUNTRY",
                countryCode: "COUNTRY CODE",
                region: "REGION CODE",
                regionName: "REGION NAME",
                city: "CITY",
                zip: "ZIP CODE",
                lat: 0.0,
                lon: 0.0,
                timezone: "TIME ZONE",
                isp: "ISP NAME",
                org: "ORGANIZATION NAME",
                as: "AS NUMBER / NAME",
                query: "IP ADDRESS USED FOR QUERY"
            }
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    componentDidMount() {
        fetch('http://ip-api.com/json/' + this.props.ip, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
        }).then(r => r.json()).then(r => {
            console.log(r);
            this.setState({
                ipInfo: r
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
                <div className="text-right">
                    <Button className="text-md-right btn-sm btn-outline-light" onClick={this.toggle}>Info</Button>
                </div>

                <Modal isOpen={this.state.modal} toggle={this.toggle} centered>
                    <ModalHeader toggle={this.toggle}>{ this.state.ipInfo.query }</ModalHeader>
                    <ModalBody>
                        <h6>{ this.state.ipInfo.country }, { this.state.ipInfo.regionName }, { this.state.ipInfo.city }</h6>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Ok, doei!</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default InfoModal;
