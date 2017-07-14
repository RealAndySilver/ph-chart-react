/**
 * Created by Parzifal
 */
import React from "react";
import ReactDOM from 'react-dom';
var _ = require('underscore');

//import ReactFlot from 'react-flot';


window.ReactDOM = ReactDOM;

import { Line } from 'react-chartjs-2';

const colorEnum = {
    properties: {
        0: { color: '#f71426', value: 0 },
        1: { color: '#EC932F', value: 1 },
        2: { color: '#b9cff7', value: 2 },
        3: { color: '#543884', value: 3 },
        4: { color: '#88bf91', value: 4 },
        5: { color: '#f79689', value: 5 }
    }
}

const date_options = {
    month: "numeric", day: "numeric", hour: "2-digit"
};

//var hours = true;
var isMinutes = false;

//Chart page component
export default class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time_array: [],
            labels: [],
            chart_values: [],
            selectedHour: "...",
            selectedMinute: "..."
        }
        this.change = this.change.bind(this);
        this.showHourDetail = this.showHourDetail.bind(this);
        this.showMinuteDetail = this.showMinuteDetail.bind(this);
        this.reset = this.reset.bind(this);
    }

    componentDidMount() {
        let getLabels = this.getLabels.bind(this);
        let getValues = this.getValues.bind(this);

        var array = this.props.dataFiltered;
        var minute_values = [], second_values = [];

        console.log("original array", array);

        //group array by tag
        var grouped = _.chain(array.data).groupBy("tag").map(function (data, tag) {
            var dataArray = _.map(data, function (it) {
                return _.omit(it, "tag");
            });
            return {
                tag: tag,
                data: dataArray
            };
        }).value();
        var i = 0;
        var time_array = [];
        console.log("grouped ", grouped);
        grouped.forEach(function (tag, index) {
            time_array.push({
                tag: tag.tag,
                var: tag.var,
                hours: []
            })
            tag.data.forEach(function (hour, h) {
                time_array[index].hours.push({
                    hour: new Date(hour.date).getHours() + 5,
                    minutes: [],
                    date: hour.date
                });
                minute_values = Object.values(hour.data)
                minute_values.forEach(function (minute, m) {
                    time_array[index].hours[h].minutes.push({
                        minute: Object.keys(hour.data)[m],
                        seconds: []
                    });
                    second_values = Object.values(minute);
                    second_values.forEach(function (second, s) {
                        time_array[index].hours[h].minutes[m].seconds.push({
                            second: Object.keys(minute)[s],
                            value: Object.values(minute)[s]
                        });
                    });
                });
            });
        });
        console.log("time array", time_array);
        var labels = getLabels(time_array);
        this.setState({
            time_array: time_array,
            labels: labels,
            chart_values: getValues(labels, time_array)
        });
    }

    getValues(labels, time_array) {
        let getAvg = this.getAvg.bind(this);

        var chart_values = [];
        var second_values = [];
        var seconds_avg_array = [];
        time_array.forEach(function (tag, i) {
            chart_values.push({
                tag: tag.tag,
                data: []
            });
            var n = 0;
            labels.forEach(function (label) {//tag.hours.forEach(function (hour, j) {
                if (label == new Date(tag.hours[n].date).toLocaleDateString("en-US", date_options)) {
                    seconds_avg_array = [];
                    tag.hours[n].minutes.forEach(function (minute) {
                        second_values = [];
                        minute.seconds.forEach(function (second) {
                            second_values.push(second.value);
                        });
                        seconds_avg_array.push(getAvg(second_values));
                    });
                    chart_values[i].data.push(getAvg(seconds_avg_array));
                    n++;
                }
            });
        });

        console.log("chart_values: XD ", chart_values);
        return chart_values;
    }

    getLabels(time_array) {
        var startDate = new Date(this.props.startDate);
        var endDate = new Date(this.props.endDate);
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
        var totalHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        console.log("total hours", totalHours);
        var n = 0, labels = [];
        for (var i = 0; i < totalHours; i++) {
            for (var j = 0; j < time_array.length; j++) {
                if (time_array[j].hours[n]) {
                    if (startDate.getHours() + i == time_array[j].hours[n].hour) {
                        var date = new Date(time_array[j].hours[n].date).toLocaleDateString("en-US", date_options);
                        labels.push(date);
                        n++;
                        break;
                    }
                }
            }
        }
        console.log("labels, ", labels);
        return labels;
    }

    getMinuteLabels(array) {
        console.log("array", array);
        var n = 0, labels = [];
        for (var i = 0; i < 60; i++) {
            for (var j = 0; j < array.length; j++) {
                if (array[j].minutes[n]) {
                    if (i == array[j].minutes[n].minute) {
                        labels.push(i);
                        n++;
                        break;
                    }
                }
            }
        }
        console.log("minlabels: ", labels);
        return labels;
    }

    getSecondLabels(array) {
        console.log("array secs", array);
        var n = 0, labels = [];
        for (var i = 0; i < 60; i++) {
            for (var j = 0; j < array.length; j++) {
                if (array[j].seconds[n]) {
                    if (i == array[j].seconds[n].second) {
                        labels.push(i);
                        n++;
                        break;
                    }
                }
            }
        }
        console.log("seclabels: ", labels);
        return labels;
    }


    getAvg(array) {
        var avg = 0;
        var n = 0;
        array.forEach(function (element) {
            avg = avg + element;
            n++;
        });
        avg = avg / n;
        return avg;
    }

    change(event) {
        if (isMinutes) {
            this.setState({ selectedMinute: event.target.value }, function () {
                this.showMinuteDetail();

            });
        } else {
            isMinutes = true;
            this.setState({ selectedHour: event.target.value }, function () {
                this.showHourDetail();

            });
        }
    }

    showHourDetail() {
        this.state.selectedMinute = '...';
        let getMinuteLabels = this.getMinuteLabels;
        let getAvg = this.getAvg;
        var time_array = this.state.time_array;
        var selectedHour = this.state.selectedHour;
        var chart_values = [], labels = [];
        var second_values = [], tempArray = [];
        time_array.forEach(function (tag, i) {
            chart_values.push({
                tag: tag.tag,
                data: []
            });
            tag.hours.forEach(function (hour) {
                var date = new Date(hour.date).toLocaleDateString("en-US", date_options);
                if (date == selectedHour) {
                    //labels = getMinuteLabels(hour.minutes);
                    tempArray.push(hour);
                    hour.minutes.forEach(function (minute) {
                        second_values = [];
                        minute.seconds.forEach(function (second) {
                            second_values.push(second.value);
                        });
                        chart_values[i].data.push(getAvg(second_values));
                    });
                }
            });
        });

        labels = getMinuteLabels(tempArray);

        console.log("hour detail ", chart_values);
        console.log("labels hour detail ", labels);
        this.setState({
            labels: labels,
            chart_values: chart_values
        });

    }

    showMinuteDetail() {
        let getSecondLabels = this.getSecondLabels;
        let getAvg = this.getAvg;
        var time_array = this.state.time_array;
        var selectedHour = this.state.selectedHour;
        var selectedMinute = this.state.selectedMinute;
        var chart_values = [], labels = [];
        var second_values = [], tempArray = [];
        time_array.forEach(function (tag, i) {
            chart_values.push({
                tag: tag.tag,
                data: []
            });
            tag.hours.forEach(function (hour) {
                var date = new Date(hour.date).toLocaleDateString("en-US", date_options);
                if (date == selectedHour) {
                    //tempArray.push(hour);
                    hour.minutes.forEach(function (minute) {
                        second_values = [];
                        if (selectedMinute == minute.minute) {
                            tempArray.push(minute);
                            minute.seconds.forEach(function (second) {
                                chart_values[i].data.push(second.value);
                            });

                        }
                    });
                }
            });
        });

        labels = getSecondLabels(tempArray);

        console.log("minute detail ", chart_values);
        console.log("labels hour detail ", labels);
        this.setState({
            labels: labels,
            chart_values: chart_values
        });
    }

    reset() {
        this.state.isMinutes = false;
        this.state.selectedHour = '...';
        this.state.selectedMinute = '...';
        var time_array = this.state.time_array;
        var labels = getLabels(time_array);
        this.setState({
            time_array: time_array,
            labels: labels,
            chart_values: getValues(labels, time_array)
        });
    }

    render() {
        console.log("rendering Data Chart");
        var minutes = null;

        var datasets = [];
        var n = 0;
        var labels = this.state.labels;
        this.state.chart_values.forEach(function (data_chart) {
            var color = colorEnum.properties[n].color;
            datasets.push({
                label: data_chart.tag,
                type: 'line',
                data: data_chart.data,
                fill: false,
                borderColor: color,
                backgroundColor: color,
                pointBorderColor: color,
                pointBackgroundColor: color,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: color
            });
            n++;
        });

        const data = {
            labels: labels,
            datasets: datasets
        };

        const renderOption = item => <option value={item}>{item}</option>;
        const hours = labels.map(renderOption);
        return (
            <div >
                    <div className="col-md-5 chart-options">
                        <h2>
                            {this.state.selectedHour != '...' ? (
                                <div><span> > </span><a onClick={this.showHourDetail}>{this.state.selectedHour} </a>
                                    {this.state.selectedMinute != '...' ?
                                        <div><span> > </span><a onClick={this.showMinuteDetail}>minute {this.state.selectedMinute}</a> </div> : <div></div>
                                    }</div>)
                                : <span></span>
                            }

                        </h2>
                        {isMinutes ? <label>Minute:</label> : <label>Hour:</label>}
                        <select className="form-control" onChange={this.change} value={this.state.selectedHour}>
                            <option value='...'>...</option>
                            {hours}
                        </select>
                    </div>
                    <Line ref='chart' data={data} ref={(ref) => this.Line = ref} /> 
            </div >
            //<ReactFlot id="product-chart" options={options} data={data} width="50%" height="100px" />
        )
    }


}
