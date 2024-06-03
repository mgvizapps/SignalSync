import React from "react";
import {Content} from "neutrine/lib/components";
import {Heading, Paragraph} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Field, FieldLabel, FieldHelper} from "neutrine/lib/components";
import {Input, Select} from "neutrine/lib/components";

import {SelectFile} from "common/src/components/SelectFile/index.js";
import {SelectSpecie} from "common/src/components/SelectSpecie/index.js";
import {LocalClient} from "../../clients/local.js";

//Export component to create a new analysis from local file
export class CreateLocal extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "hasFileSelected": false,
            "hasSpecieSelected": false
        };
        //Referenced elements
        this.ref = {
            "file": React.createRef(),
            "specie": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSpecieChange = this.handleSpecieChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }
    //Handle specie change --> set that we have specie
    handleSpecieChange() {
        return this.setState({"hasSpecieSelected": true});
    }
    //Handle file selected
    handleFileChange(hasFile) {
        return this.setState({"hasFileSelected": hasFile});
    }
    //Handle submit
    handleSubmit() {
        //Check if submit is not enabled
        if (!this.state.hasFileSelected || !this.state.hasSpecieSelected) {
            return null;
        }
        //Submit run options
        return this.props.onSubmit(new LocalClient({
            "file": this.ref.file.current.value(),
            "specie": this.ref.specie.current.value()
        }));
    }
    //Render home view
    render() {
        let self = this;
        let submitEnabled = this.state.hasFileSelected && this.state.hasSpecieSelected;
        return (
            <React.Fragment>
                <Field>
                    <FieldLabel>Select TAR file</FieldLabel>
                    <SelectFile ref={this.ref.file} accepted={["tar"]} onChange={this.handleFileChange} />
                    <FieldHelper>You should select a <strong>.tar</strong> file with xxxxxxxx.</FieldHelper>
                </Field>
                {/* Select specie */}
                <Field>
                    <FieldLabel>Select specie</FieldLabel>
                    <SelectSpecie ref={this.ref.specie} onChange={this.handleSpecieChange} />
                    <FieldHelper>Select xxxxxxxx</FieldHelper>
                </Field>
                {/* Submit button */}
                <div className="siimple--mt-3">
                    <Btn color="success" fluid onClick={this.handleSubmit} disabled={!submitEnabled}>
                        <strong>Start explorer</strong>
                    </Btn>
                </div>
            </React.Fragment>
        );
    }
}


