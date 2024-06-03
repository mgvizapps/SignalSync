import React from "react";
import ReactDOM from "react-dom";
import Rouct from "rouct";
import {Renderer, ForEach} from "neutrine/lib/components";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Footer} from "neutrine/lib/components";
import {whenReady, classNames} from "neutrine/lib/utils";

import {Notifications} from "./components/Notifications/index.js";
import config from "../config.json";

import "./style.scss";
import "siimple/dist/siimple.css";
import "siimple-experiments/dist/siimple-experiments.css";
import "siimple-icons/dist/siimple-icons.css";
import "neutrine/lib/components.css";
import "neutrine/lib/datatable.css";

//Import application pages
import {HomePage} from "./pages/Home.js";

//Import available apps
import {CNVReporterApp} from "cnvreporter/src/index.js";
import {VismapperApp} from "vismapper/src/index.js";
import {SeqmaskApp} from "seqmask/src/index.js";

//List of available apps
let availableApps = {
    "vismapper": VismapperApp,
    "cnvreporter": CNVReporterApp,
    "seqmask": SeqmaskApp
};

//Main app wrapper
class App extends React.Component {
    constructor(props) {
        super(props);
        //Bind methods
        this.handleHomeClick = this.handleHomeClick.bind(this);
    }
    //Handle home click --> redirect to home page
    handleHomeClick() {
        return Rouct.redirect("/");
    }
    //Render the app content
    render() {
        let self = this;
        return (
            <Rouct.HashbangRouter>
                {/* Render navbar inside a route component */}
                <Rouct.Route path="*" render={function (request) {
                    console.log(request.path);
                    return (
                        <Navbar size="xlarge" style={{"flexWrap":"no-wrap"}}>
                            <NavbarBrand>
                                {/* MGviz apps brand */}
                                <span onClick={self.handleHomeClick}>
                                    <strong>MGviz</strong>Apps
                                </span>
                                {/* Application title */}
                                <Rouct.Route path="/apps/:name" exact render={function (request) {
                                    return ` / ${request.params.name}`;
                                }} />
                            </NavbarBrand>
                            <NavbarContent>
                                {/* Navigation links */}
                                {/*
                                <ForEach items={config.navigationLinks} render={function (link, index) {
                                    return React.createElement(NavbarItem, {
                                        "className": classNames({
                                            "siimple-navbar-item--active": request.path === link.path
                                        }),
                                        "onClick": function () {
                                            return Rouct.redirect(link.path);
                                        },
                                        "key": index
                                    }, link.title);
                                }} />
                                */}
                            </NavbarContent>
                            <Notifications />
                        </Navbar>
                    );
                }} />
                {/* Main switch --> check the page */}
                <Content size="xlarge">
                    <Rouct.Switch context="default">
                        <Rouct.Route path="/" exact render={function () {
                            return React.createElement(HomePage, {
                                "apps": self.props.apps
                            });
                        }} />
                        <Rouct.Route path="*" render={function (request) {
                            //Check for no app registered on this route --> 404 page
                            if (typeof self.props.apps[request.pathname] === "undefined") {
                                return "Not found";
                            }
                            //Get app configuration
                            let app = self.props.apps[request.pathname].app; //Get app name
                            let appConfig = self.props.apps[request.pathname]; //App config
                            return React.createElement(availableApps[app], appConfig);
                        }} />
                        <Rouct.Route path="*" render={function (request) {
                            return "Not found";
                        }} />
                    </Rouct.Switch>
                </Content>
                {/* Footer content */}
                <Footer size="xlarge" align="center">
                    <div align="center">
                        <strong>MGvizApps Platform</strong>
                    </div>
                    <div className="siimple--text-small" align="center">
                        UGD Lab (INCLIVA), I2Sysbio, Kanteron Systems
                    </div>
                </Footer>
            </Rouct.HashbangRouter>
        );
    }
}

//Mount app
whenReady(function () {
    let parent = document.getElementById("root");
    let props = {
        "title": config.title,
        "subtitle": config.subtitle,
        "apps": config.apps
    };
    //return ReactDOM.render(<App />, document.getElementById("root"));
    return ReactDOM.render(React.createElement(App, props), parent);
});

