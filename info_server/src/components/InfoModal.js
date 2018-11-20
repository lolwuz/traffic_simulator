import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class InfoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            api_key: "8e417732665ae4aa0b60fb5f07fd645d",
            ipInfo: []
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    componentDidMount() {
        fetch('https://get.geojs.io/v1/ip/geo.json?ip=' + this.props.controller.client[0], {
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
        let info = this.state.ipInfo.map((info, i) => {
            return (
                <Modal key={i} isOpen={this.state.modal} toggle={this.toggle} fade={false}>
                    <ModalHeader toggle={this.toggle}>{ info.ip }</ModalHeader>
                    <ModalBody>
                        <h6>{ info.organization_name }</h6>
                        <h6>{ info.country } ({info.country_code}), { info.region }, { info.city } </h6>
                        <img width="100%" src={"https://open.mapquestapi.com/staticmap/v4/getmap?key=EbU0NmAcZ7zv7YDILsIUteKoJyNR8hZo&size=600,400&zoom=13&center=" + info.latitude +","+ info.longitude  + "&type=map"}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Dismiss</Button>
                    </ModalFooter>
                </Modal>
            );
        });

        return (
            <div>
                <div className="text-right">
                    <Button className="text-md-right btn-sm btn-outline-light" onClick={this.toggle}>Info</Button>
                </div>

                { info }
            </div>
        );
    }
}

export default InfoModal;
