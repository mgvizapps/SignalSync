import React from "react";
import {ForEach} from "neutrine/lib/components";
import {Select} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";

import {getSpecies} from "../../species.js";

//Export specie selection
export class SelectSpecie extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "hasSelection": false,
            "species": []
        };
        //Referenced elements
        this.ref = {
            "input": React.createRef()
        };
        //Bind methods
        this.handleChange = this.handleChange.bind(this);
        this.value = this.value.bind(this);
    }
    //Component did mount --> import species data
    componentDidMount() {
        let self = this;
        return getSpecies().then(function (species) {
            return self.setState({
                "species": species
            });
        });
    }
    //Handle input change --> we have selected an specie
    handleChange() {
        return this.setState({"hasSelection": true}, this.props.onChange);
    }
    //Get the specie value
    value() {
        if (this.state.hasSelection === true) {
            let index = parseInt(this.ref.input.current.value);
            return this.state.species[index]; //Return specie data
        }
        //No specie selected
        return null;
    }
    //Render the select species component
    render() {
        let self = this;
        //Check for no species available --> render loading spinner instead
        if (this.state.species.length === 0) {
            return (
                <div align="center">
                    <Spinner color="primary" />
                </div>
            );
        }
        //Render species select
        return (
            <Select fluid ref={this.ref.input} onChange={this.handleChange} defaultValue="">
                <option hidden disabled value=""> -- select an option -- </option>
                <ForEach items={this.state.species} render={function (item, index) {
                    return React.createElement("option", {"value": index, "key": index}, item.name);
                }} />
            </Select>
        );
    }
}

//Specie selection default props
SelectSpecie.defaultProps = {
    "onChange": null
};

