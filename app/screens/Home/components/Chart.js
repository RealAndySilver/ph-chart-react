/**
 * Created by Parzifal
 */
import React from "react";
import ReactDOM from 'react-dom';
import $ from "jquery";

var _ = require('underscore');

window.ReactDOM = ReactDOM;

import { Line } from 'react-chartjs-2';

const colorEnum = {
    properties: {
        0: { color: '#f71426', value: 0 },
        1: { color: '#EC932F', value: 1 },
        2: { color: '#b9cff7', value: 2 },
        3: { color: '#543884', value: 3 },
        4: { color: '#88bf91', value: 4 },
        5: { color: '#f79689', value: 5 },
        6: { color: '#ced0f7', value: 6 },
        7: { color: '#cf73c9', value: 7 }
    }
}

const date_options = {
    month: "numeric", day: "numeric", hour: "2-digit"
};

const minute_options = {
    minute: "2-digit"
};

var isMinutes = false, showDrop = true, isSecond = false;

//Chart page component
export default class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time_array: [],
            labels: [],
            chart_values: [],
            selectedHour: "...",
            selectedMinute: "...",
            selectedTag: null,
            realTimeData: null,
            realTimeRefresh: 5000
        }

        this.change = this.change.bind(this);
        this.showHourDetail = this.showHourDetail.bind(this);
        this.showMinuteDetail = this.showMinuteDetail.bind(this);
        this.reset = this.reset.bind(this);
        this.getLastMinute = this.getLastMinute.bind(this);
        this.changeRealTime = this.changeRealTime.bind(this);

    }

    componentDidMount() {
        let loadRealTime = this.loadRealTime.bind(this);
        if(!this.props.realTimeData){
            this.reset();
        }
        setInterval(function () {
            if (this.props.isRealTime) {
                loadRealTime();
            }
        }.bind(this), this.state.realTimeRefresh);

        this.initArray(this.props.dataFiltered);

    }


    initArray(array) {
        var time_array = this.getTimeArray(array);

        if (this.props.isRealTime) {
            console.log("real_time_array:", time_array);
            var now = new Date();
            now.setSeconds(now.getSeconds() - 10);
            this.setState({
                time_array: time_array,
                selectedHour: new Date().toLocaleDateString("en-US", date_options),
                selectedMinute: now.getMinutes()
            }, function () {
                this.showMinuteDetail();
                /*if (isMinutes && isSecond) {
                    console.log("showMinuteDetail");
                    
                } else {
                    isMinutes = true;
                    this.showHourDetail();
                }*/

            });
        } else {
            var labels = this.getLabels(time_array);
            this.setState({
                time_array: time_array,
                labels: labels,
                chart_values: this.getValues(labels, time_array)
            });
        }
    }

    loadRealTime() {
        var url = this.props.url;
        isMinutes = true;
        isSecond = true;
        $.ajax({
            url: url,
            contentType: "application/json",
            success: function (realTimeData) {
                this.setState({
                    realTimeData: realTimeData,
                    //selectedHour: new Date().toLocaleDateString("en-US", date_options),
                    //selectedMinute: new Date().getMinutes(),
                });
                console.log("realTimeData ", realTimeData);
                //this.showHourDetail();

                this.initArray(realTimeData);
            }.bind(this),
            error: function (xhr, status, error) {
                console.error(status, error.toString());
            }
        });
    }

    getTimeArray(array) {
        var minute_values = [], second_values = [];
        console.log("original array", array);

        //group array by tag an sort by date
        var grouped = _.chain(array.data).groupBy("tag").map(function (data, tag) {
            var sortedArray = _.sortBy(data, function (o) { return o.date; });
            var dataArray = _.map(sortedArray, function (it) {
                return _.omit(it, "tag");
            });
            return {
                tag: tag,
                data: dataArray
            };
        }).value();
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
                    hour: new Date(hour.date).getHours(),
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
        return time_array;
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
        return chart_values;
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

    getLabels(time_array) {
        var startDate = new Date(this.props.startDate);
        var endDate = new Date(this.props.endDate);
        startDate.setHours(0, 0, 0);
        endDate.setHours(23, 59, 59);
        var totalHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        var n = 0, labels = [], h = 0;
        for (var i = 0; i < totalHours; i++) {
            for (var j = 0; j < time_array.length; j++) {
                if (time_array[j].hours[n]) {
                    if (h == 24) {
                        h = 0;
                    }
                    if (startDate.getHours() + h == time_array[j].hours[n].hour) {
                        var date = new Date(time_array[j].hours[n].date).toLocaleDateString("en-US", date_options);
                        labels.push(date);
                        n++;
                        break;
                    }
                }
            }
            h++;
        }
        console.log("labels, ", labels);
        return labels;
    }

    getMinuteLabels(array, from, to) {
        var n = 0, labels = [];
        for (var i = from; i < to; i++) {
            if (i == 60) {
                i = 0;
            }
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
        console.log("minute labels ", labels);
        return labels;
    }

    getSecondLabels(array, from, to) {
        var n = 0, labels = [];
        for (var i = from; i < to; i++) {
            if (i == 60) {
                i = 0;
            }
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
        console.log("second labels ", labels);
        return labels;
    }

    change(event) {
        if (isMinutes) {
            this.setState({ selectedMinute: event.target.value }, function () {
                this.showMinuteDetail();

            });
        } else {
            isMinutes = true;
            this.setState({ selectedHour: event.target.value }, function () {
                this.state.selectedMinute = '...';
                this.showHourDetail();

            });
        }
    }

    showHourDetail() {
        showDrop = true;
        isSecond = false;
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

        console.log("hourDetail: ", tempArray);

        labels = this.getMinuteLabels(tempArray, 0, 60);
        console.log("chart_values ", chart_values);
        this.setState({
            labels: labels,
            chart_values: chart_values
        });
    }

    showMinuteDetail() {
        isSecond = true;
        showDrop = false;
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
                    console.log("selectedMinute: ", selectedMinute);
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

        console.log("minuteDetail: ", tempArray);

        labels = this.getSecondLabels(tempArray, 0, 60);
        this.setState({
            labels: labels,
            chart_values: chart_values
        });
    }

    reset() {
        showDrop = true;
        isMinutes = false;
        this.state.selectedHour = '...';
        this.state.selectedMinute = '...';
        var time_array = this.state.time_array;
        var labels = this.getLabels(time_array);
        this.setState({
            time_array: time_array,
            labels: labels,
            chart_values: this.getValues(labels, time_array)
        });
    }

    getLastMinute() {
        this.setState({
            selectedMinute: new Date().getMinutes()
        });
        isSecond = true;
    }

    changeRealTime(event) {
        this.setState({
            realTimeRefresh: event.target.value
        });
    }

    render() {
        console.log("rendering Data Chart");
        var minutes = null;
        var tags = [];
        var datasets = [];
        var n = 0;
        var labels = this.state.labels;
        this.state.chart_values.forEach(function (data_chart) {
            var color = colorEnum.properties[n].color;
            tags.push(data_chart.tag);
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

        const renderButtons = item => <option value={item}>{item}</option>;
        const tagButtons = tags.map(renderButtons);
        const renderOption = item => <option value={item}>{item}</option>;
        const hours = labels.map(renderOption);
        return (
            <div >
                <div className="col-md-6 chart-options">
                    <h2>
                        <div><button onClick={this.reset} disabled={this.props.isRealTime}><span>Chart</span> </button><span> ></span></div>
                        {this.state.selectedHour != '...' ? (
                            <div><span>> </span><button disabled={this.props.isRealTime} onClick={this.showHourDetail}>{this.state.selectedHour} </button><span> ></span>
                                {this.state.selectedMinute != '...' ?
                                    <div><span>> </span><button disabled={this.props.isRealTime} onClick={this.showMinuteDetail}>minute {this.state.selectedMinute}</button> </div> : <div></div>
                                }</div>)
                            : <span></span>
                        }

                    </h2>
                    {showDrop ? <div>
                        {isMinutes ? <label>Minute:</label> : <label>Hour:</label>}
                        <select className="form-control" disabled={this.props.isRealTime} onChange={this.change} value={this.state.selectedHour}>
                            <option value='...'>...</option>
                            {hours}
                        </select>
                        {/*<button onClick={this.getLastMinute} >last minute</button>*/}
                    </div> : <div></div>}
                    {this.props.isRealTime != null ?

                        <div className="col-md-3">
                            <label>Reload every:</label>
                            <select className="form-control" onChange={this.changeRealTime} value={this.state.realTimeRefresh}>
                                <option value='60000'>60 seconds</option>
                                <option value='30000'>30 seconds</option>
                                <option value='5000'>10 seconds</option>

                            </select>
                        </div>
                        :
                        <div></div>
                    }

                </div>
                <Line ref='chart' data={data} ref={(ref) => this.Line = ref} />
            </div >
        )
    }


}
