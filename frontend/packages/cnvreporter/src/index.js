import React from "react";
import kofi from "kofi";
import Rouct from "rouct";

//Import views
import {HomeView} from "./views/Home.js";
import {DashboardView} from "./views/Dashboard.js";

//Export CNVReporter app
export class CNVReporterApp extends React.Component {
    constructor(props) {
        super(props);
        //Build initial state
        this.state = {
            "client": null
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        //this.handleExit = this.handleExit.bind(this);
    }
    //Handle submit
    handleSubmit(client) {
        //this.client = new LocalClient(options); //Initialize local client
        return this.setState({"client": client}, function () {
            return Rouct.redirect("cnvreporter", "/dashboard");
        });
    }
    //Render app content
    render() {
        let self = this;
        return (
            <Rouct.MemoryRouter context="cnvreporter">
                <Rouct.Switch context="cnvreporter">
                    <Rouct.Route path="/" exact render={function () {
                        return React.createElement(HomeView, {
                            "title": self.props.title,
                            "description": self.props.description,
                            "sampleData": self.props.sampleData,
                            "onSubmit": self.handleSubmit
                        });
                    }} />
                    <Rouct.Route path="/dashboard" render={function () {
                        return React.createElement(DashboardView, {
                            "client": self.state.client
                        });
                    }} />
                </Rouct.Switch>
            </Rouct.MemoryRouter>
        );
    }
}

//Default props
CNVReporterApp.defaultProps = {
    "title": "CNVReporter",
    "description": "CNVReporter is a MGvizApp for exploring and reporting Copy Number Variants (CNVs) interactively.",
    "sampleData": null
};


