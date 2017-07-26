/**
 * Created by Parzifal
 */
import React from 'react';
import { render } from "react-dom";
import $ from "jquery";
import FilteredMultiSelect from 'react-filtered-multiselect';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import MultiSelect from "./components/MultiSelect";
import Chart from "./components/Chart";
import Table from "./components/Table";

var Loader = require('react-loader');


const BOOTSTRAP_CLASSES = {
    filter: 'form-control',
    select: 'form-control',
    button: 'btn btn btn-block btn-default',
    buttonActive: 'btn btn btn-block btn-primary',
}
//import React components

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedOptions: [],
            startDate: moment(),
            endDate: moment(),
            variable: 'PV',
            dataFiltered: null,
            loaded: true,
            isRealTime: false
        }
        this.loadDataFiltered = this.loadDataFiltered.bind(this);
        this.loadRealTime = this.loadRealTime.bind(this);
        this.loadMultiSelect = this.loadMultiSelect.bind(this);
        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
        this.change = this.change.bind(this);
    }

    componentDidMount() {
    }
    handleSelectedOptions(selectedOptions) {
        this.setState({
            selectedOptions: selectedOptions
        });
    }

    handleChangeStart(date) {
        this.setState({
            startDate: date
        });
    }

    handleChangeEnd(date) {
        this.setState({
            endDate: date
        });
    }

    loadMultiSelect(filter) {
        var url = "http://107.170.10.118:3001/mongo-api/getTagsLike/" + filter;

        $.ajax({
            url: url,
            contentType: "application/json",
            type: 'GET',
            success: function (data) {

                this.setState({ data: data });

            }.bind(this),
            error: function (xhr, status, error) {
                console.error(status, error.toString());
            }
        })
    }

    loadDataFiltered() {
        this.setState({
            loaded: false
        });
        this.setState({ dataFiltered: null });
        var tags = '';
        this.state.selectedOptions.forEach(function (obj) {
            tags = tags + obj.tag + ',';
        });
        tags = tags.slice(',', -1);
        var startDate = new Date(this.state.startDate);
        var endDate = new Date(this.state.endDate);
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
        var variable = this.state.variable;
        var url = "http://107.170.10.118:3001/mongo-api/get/" + tags + "/" + startDate + "/" + endDate + "/" + variable;
        $.ajax({
            url: url,
            contentType: "application/json",
            success: function (dataFiltered) {
                this.setState({ dataFiltered: dataFiltered });
                this.setState({ loaded: true });
                console.log("dataFiltered", this.state.dataFiltered);
                console.log("url: ", url);
            }.bind(this),
            error: function (xhr, status, error) {
                console.error(status, error.toString());
            }
        })


    }

    loadRealTime() {
        this.setState({
            loaded: false
        });
        this.setState({ dataFiltered: null });
        var tags = '';
        this.state.selectedOptions.forEach(function (obj) {
            tags = tags + obj.tag + ',';
        });
        tags = tags.slice(',', -1);
        var variable = this.state.variable;
        var url = "http://107.170.10.118:3001/mongo-api/getLatest/" + tags + "/" + variable;
        $.ajax({
            url: url,
            contentType: "application/json",
            success: function (dataFiltered) {
                this.setState({
                    isRealTime: true,
                    dataFiltered: dataFiltered,
                    url: url
                });
                this.setState({ loaded: true });
                console.log("dataFiltered", this.state.dataFiltered);
            }.bind(this),
            error: function (xhr, status, error) {
                console.error(status, error.toString());
            }
        })


    }

    change(event) {
        this.setState({ variable: event.target.value });
    }



    render() {
        console.log("rendering app component");
        var data = this.state.data;
        var array = data.data;
        var tags = [];
        var times = [];
        var i = 0;
        if (array) {
            array.forEach(function (obj) {
                tags.push({
                    "id": i,
                    "tag": obj._id
                });
                i++;
            });
        }
        var { selectedOptions } = this.state;
        return (
            <div>
                <MultiSelect
                    selectedOptions={selectedOptions}
                    tags={tags}
                    loadMultiSelect={this.loadMultiSelect.bind(this)}
                    handleSelectedOptions={this.handleSelectedOptions.bind(this)}
                //setHomeState={this.setState.bind(this)}
                />

                <div className="col-md-5">
                    <label>Select list:</label>
                    <select className="form-control" onChange={this.change} value={this.state.variable}>
                        <option>PV</option>
                        <option>AP</option>
                        <option>IR</option>
                        <option>SD</option>
                        <option>ED</option>
                    </select>
                </div>
                <div className="col-md-12 dates">
                    <label>from
                    </label>
                    <DatePicker
                        selected={this.state.startDate}
                        onChange={this.handleChangeStart}
                    />
                    <label>to
                    </label>
                    <DatePicker
                        selected={this.state.endDate}
                        onChange={this.handleChangeEnd}
                    />
                </div>
                <button type="button" className="btn btn btn-default" onClick={this.loadDataFiltered}>Load Chart</button>
                <button type="button" className="btn btn btn-default" onClick={this.loadRealTime}>Load Real Time</button>

                <Loader loaded={this.state.loaded}>

                    {this.state.dataFiltered != null && this.state.variable == 'PV' ?
                        <div>                         
                            <Chart
                                dataFiltered={this.state.dataFiltered}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                isRealTime={this.state.isRealTime}
                                loadRealTime={this.loadRealTime}
                                url={this.state.url}

                            />
                        </div> :
                        this.state.dataFiltered != null && this.state.variable == 'AP' ?
                            <Table
                                dataFiltered={this.state.dataFiltered}
                            />

                            :
                            <div></div>}
                </Loader>
            </div>
        )
    }
}