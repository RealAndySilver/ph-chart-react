/**
 * Created by Parzifal
 */
import React from 'react';
import { render } from "react-dom";
import $ from "jquery";
import FilteredMultiSelect from 'react-filtered-multiselect';

const BOOTSTRAP_CLASSES = {
    filter: 'form-control',
    select: 'form-control',
    button: 'btn btn btn-block btn-default',
    buttonActive: 'btn btn btn-block btn-primary',
}
//import React components

export default class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOptions: this.props.selectedOptions
        }
    }

    handleDeselect(index) {
        var selectedOptions = this.state.selectedOptions.slice()
        selectedOptions.splice(index, 1)
        this.setState({ selectedOptions })
        this.props.handleSelectedOptions(selectedOptions);
    }

    handleClearSelection = (e) => {
        this.setState({ selectedOptions: [] })
    }
    handleSelectionChange = (selectedOptions) => {
        selectedOptions.sort((a, b) => a.id - b.id)
        if (selectedOptions.length > 8) {
            alert("Can't Add more than 8 elements!!");
        } else {
            this.setState({ selectedOptions })
            this.props.handleSelectedOptions(selectedOptions);
        }
    }

    onInputChange(term) {
        this.setState({ term });
        this.props.loadMultiSelect(term);
    }

    render() {
        console.log("rendering multi select");
        var { selectedOptions } = this.state;
        return (
            <div className="multi-select">
                <div className="col-md-5">
                    <input type="text" className="form-control" placeholder="Search Tag..."
                        value={this.state.term}
                        onChange={event => this.onInputChange(event.target.value)} />

                    <FilteredMultiSelect
                        classNames={BOOTSTRAP_CLASSES}
                        onChange={this.handleSelectionChange}
                        //onChange={event => this.onInputChange(event.target.value)}
                        options={this.props.tags}
                        selectedOptions={selectedOptions}
                        textProp="tag"
                        valueProp="id"

                    />
                </div>
                <div className="selected_box col-md-5">
                    {selectedOptions.length === 0 && <p>(nothing selected yet)</p>}
                    {selectedOptions.length > 0 && <ol>
                        {selectedOptions.map((ship, i) => <li key={ship.id}>
                            {`${ship.tag} `}
                            <span style={{ cursor: 'pointer' }} onClick={() => this.handleDeselect(i)}>
                                &times;
                            </span>
                        </li>)}
                    </ol>}
                    {selectedOptions.length > 0 && <button style={{ marginLeft: 20 }} className="btn btn-default" onClick={this.handleClearSelection}>
                        Clear Selection
                </button>}
                </div>
            </div>)
    }
}