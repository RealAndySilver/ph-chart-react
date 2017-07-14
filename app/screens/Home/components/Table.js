/**
 * Created by Parzifal
 */
import React from "react";
import ReactDOM from 'react-dom';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
window.ReactDOM = ReactDOM;

var os = require("os");
var hostname = os.hostname();
hostname = "http://107.170.10.118:3000"



//Front page component
export default class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    componentDidMount() {
        var array = this.props.dataFiltered;
        var data = [];
        var tagdata = [], minute_values = [];
        console.log("array: ", array);
        array.data.forEach(function (tag) {
            var name = tag.tag;
            var date = tag.date;
            var tagdata = Object.values(tag.data);
            tagdata.forEach(function (minute) {
                //date.setMinutes(Object.keys(minute));
                minute_values = Object.values(minute)
                //console.log("minute: ", Object.keys(minute));
                minute_values.forEach(function (value) {
                    value = value.substring(1);
                    //date.setSeconds(Object.keys(value));
                    //second_values = Object.values(minute);
                    data.push({
                        tag: name,
                        date: date,
                        path: hostname + value
                    });
                    //data_chart_array.data.push(second);       
                });
            });
        });
        console.log("data : ", data);
        this.setState({
            data: data
        });
    }

    buttonFormatter(cell, row) {
        return '<a type="submit"  target="_blank" href='+cell+'>'+cell+'</a>';
    }

    render() {
        return (
            <BootstrapTable data={this.state.data} striped hover condensed>
                <TableHeaderColumn width='33%' dataField='tag' isKey>Tag</TableHeaderColumn>
                <TableHeaderColumn width='33%' dataField='date'>Date</TableHeaderColumn>
                <TableHeaderColumn width='33%' dataField='path' dataFormat={this.buttonFormatter}  >Path</TableHeaderColumn>
            </BootstrapTable>
        )
    }


}
