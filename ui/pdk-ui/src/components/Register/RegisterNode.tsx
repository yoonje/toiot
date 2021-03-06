import React, { Component } from 'react';
import Select from 'react-select';
import {
	sensorListElem,
	sensorOptionsElem,
	sinkListElem,
	locationElem,
	sinkOptionsElem,
} from '../../ElemInterface/ElementsInterface';
import { NODE_URL } from '../../defineUrl';
import LarLngPicker from '../LatLngPicker';
// react-select : https://github.com/JedWatson/react-select

interface RegisterNodeState {
	node_name: string;
	group: string;
	location: locationElem;
	sink_id: number;
	sensors: Array<sensorOptionsElem>;
	nameValid: boolean;
	groupValid: boolean;
	sensorValid: boolean;
	sinkValid: boolean;
}

interface RegisterNodeProps {
	sensorList: Array<sensorListElem>;
	sinkList: Array<sinkListElem>;
}

/*
RegisterNode
- Show modal to register node
*/
class RegisterNode extends Component<RegisterNodeProps, RegisterNodeState> {
	state: RegisterNodeState = {
		node_name: '',
		group: '',
		location: {
			lon: 0,
			lat: 0,
		},
		sink_id: 0,
		sensors: [],

		nameValid: false,
		groupValid: false,
		sensorValid: false,
		sinkValid: false,
	};

	// Handle node name change by typing
	handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// name valid check : user should enter node name
		if (e.target.value.length > 0) {
			this.setState({
				node_name: e.target.value,
				nameValid: true,
			});
		} else {
			this.setState({
				node_name: e.target.value,
				nameValid: false,
			});
		}
	};

	// Handle group change by typing
	handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// group valid check : user should enter group name
		if (e.target.value.length > 0) {
			this.setState({
				group: e.target.value,
				groupValid: true,
			});
		} else {
			this.setState({
				group: e.target.value,
				groupValid: false,
			});
		}
	};

	// Handle LarLng change by pick lat, lon at map
	handleLarLngChange = (location: locationElem) => {
		this.setState({
			location,
		});
	};

	// Handle selected sensor change by selecting sensors
	handleSensorsChange = (sensors: any) => {
		// sensor valid check : user should select more than a sensor
		if (sensors !== null || sensors !== []) {
			this.setState({
				sensors,
				sensorValid: true,
			});
		} else {
			this.setState({
				sensors,
				sensorValid: false,
			});
		}
	};

	// Handle selected sink change by selecting sink
	handleSinkChange = (sink: any) => {
		// sink valid check : user should select sink
		if (sink !== null) {
			this.setState({
				sink_id: sink.id,
				sinkValid: true,
			});
		} else {
			this.setState({
				sink_id: sink.id,
				sinkValid: false,
			});
		}
	};

	// Handle submit button click event
	handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		var url = NODE_URL;
		var data = this.state;
		var sensor_uuid = data.sensors.map((val: sensorOptionsElem) => {
			return { uuid: val.uuid };
		});

		// Valid check (unvalid -> alert)
		if (!this.state.nameValid) {
			alert('Please enter node name.');
			return;
		}
		if (!this.state.groupValid) {
			alert('Please enter group.');
			return;
		}
		if (!this.state.sensorValid) {
			alert('Please select more than a sensor.');
			return;
		}
		if (!this.state.sinkValid) {
			alert('Please enter sink.');
			return;
		}

		// Check whether user really want to submit
		var submitValid: boolean;
		submitValid = window.confirm('Are you sure to register this node?');
		if (!submitValid) {
			return;
		}

		console.log(
			JSON.stringify({
				name: data.node_name,
				group: data.group,
				location: {
					lat: data.location.lat,
					lon: data.location.lon,
				},
				sensors: sensor_uuid,
			})
		);

		fetch(url, {
			method: 'POST', // or 'PUT'
			body: JSON.stringify({
				name: data.node_name,
				group: data.group,
				location: {
					lat: data.location.lat,
					lon: data.location.lon,
				},
				sink_id: data.sink_id,
				sensors: sensor_uuid,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((response) => console.log('Success:', JSON.stringify(response)))
			.catch((error) => console.error('Error:', error))
			.then(() => window.location.reload(false)); // nodeList will change so reload for reflecting change
	};

	render() {
		let sensorOptions: Array<sensorOptionsElem>;
		sensorOptions = this.props.sensorList.map((val: sensorListElem) => {
			return {
				label: val.name,
				value: val.name,
				uuid: val.uuid,
				value_list: val.value_list,
			};
		});
		let sinkOptions: Array<sinkOptionsElem>;
		sinkOptions = this.props.sinkList.map((val: sinkListElem) => {
			return { label: val.name, value: val.name, id: val.id };
		});
		return (
			<>
				<div
					className="modal fade"
					id="register-node-modal"
					role="dialog"
					aria-labelledby="register-node-modal"
				>
					<div className="modal-dialog  modal-lg" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title" id="register-node-modal">
									Register node
								</h4>
								<button
									type="button"
									className="close"
									data-dismiss="modal"
									aria-label="Close"
								>
									<span aria-hidden="true">×</span>
								</button>
							</div>
							<div className="modal-body">
								<form>
									<div className="form-group">
										<label>Node name</label>
										<input
											type="text"
											className="form-control"
											name="node_name"
											placeholder="name"
											value={this.state.node_name}
											onChange={this.handleNameChange}
										/>
									</div>
									<div className="form-group">
										<label>group</label>
										<input
											type="text"
											className="form-control"
											name="group"
											placeholder="group"
											value={this.state.group}
											onChange={this.handleGroupChange}
										/>
									</div>
									<div>
										<label>location</label>
										<LarLngPicker
											handleLarLngChange={this.handleLarLngChange}
										/>
									</div>
									<div className="form-group">
										<label>Select sensors</label>
										<Select
											isMulti
											className="basic-multi-select"
											name="sensors"
											options={sensorOptions}
											classNamePrefix="select"
											value={this.state.sensors}
											onChange={this.handleSensorsChange}
										/>
									</div>
									<div className="form-group">
										<label>Select sink</label>
										<Select
											className="basic-select"
											name="sink"
											options={sinkOptions}
											classNamePrefix="select"
											onChange={this.handleSinkChange}
										/>
									</div>
									<div className="modal-footer">
										<button
											type="submit"
											className="btn"
											onClick={this.handleSubmit}
											style={{ background: 'pink' }}
										>
											Submit
										</button>
										<button
											type="reset"
											className="btn btn-default"
											data-dismiss="modal"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default RegisterNode;
