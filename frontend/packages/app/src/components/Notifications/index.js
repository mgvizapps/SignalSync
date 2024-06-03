import React from "react";
import {classNames} from "neutrine/lib/utils";
import {If, ForEach, Renderer} from "neutrine/lib/components";
import {Alert} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Progress} from "neutrine/lib/components";
import {tasks} from "common/src/tasks.js";
import style from "./style.scss";

//Export notifications component
export class Notifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //"messages": [{"error": true, "name": "Task 1"}, {"error": false, "name": "Task 2"}],
            "messages": [],
            "active": false,
            "visible": false,
            "running": false,
            "runningTask": "test",
            "runningName": ""
        };
        //Bind methods
        this.handleTaskStart = this.handleTaskStart.bind(this);
        this.handleTaskEnd = this.handleTaskEnd.bind(this);
        this.handleTaskError = this.handleTaskError.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    //Component did mount --> register notification listeners
    componentDidMount() {
        let self = this;
        tasks.addEventListener("start", self.handleTaskStart);
        tasks.addEventListener("end", self.handleTaskEnd);
        tasks.addEventListener("error", self.handleTaskError);
    }
    //Component will unmount --> remove listeners
    componentWillUnmount() {
        return null;
    }
    //Handle task start --> display message of running task
    handleTaskStart(task) {
        return this.setState({
            "active": true,
            "running": true,
            "runningTask": task.type,
            "runningName": task.name
        });
    }
    //Handle task end --> remove running message and display completed message
    handleTaskEnd(task) {
        let messages = this.state.messages; //Get current messages
        messages.unshift({"error": false, "name": task.name, "type": task.type});
        return this.setState({
            "active": true,
            "running": false,
            "messages": messages
        });
    }
    //Handle task error --> register a new error message
    handleTaskError(task) {
        return null;
    }
    //Handle notification click
    handleClick() {
        return this.setState({
            "active": false,
            "visible": !this.state.visible
        });
    }
    //Render the notifications item
    render() {
        let self = this;
        let buttonClass = classNames({
            [style.button]: true,
            [style.buttonActive]: this.state.active || this.state.visible
        });
        let runningClass = classNames({
            "siimple--p-3": true,
            "siimple--bg-white": true,
            "siimple--border-rounded": true,
            "siimple--mb-2": this.state.messages.length > 0
        });
        //Render notification
        return (
            <div className={style.root}>
                    {/*<div className={buttonClass} onClick={this.handleClick}>
                    <Icon icon="bell" size="24px" />
                </div>*/}
                <Btn color="light" className="siimple--px-3">
                    <Icon icon="bell" size="24px" />
                </Btn>
                {/* Dropdown menu */}
                <If condition={this.state.visible}>
                    <div className={style.dropdown}>
                        {/* Task running */}
                        <If condition={this.state.running}>
                            <div className={runningClass}>
                                <div className="siimple--text-small siimple--text-muted siimple--mb-1">
                                    <strong>Running {this.state.runningTask} task</strong>
                                </div>
                                <Progress striped velocity="fast" completed={100} className="siimple--mb-0 siimple-progress--small" />
                            </div>
                        </If>
                        {/* Messages */}
                        <ForEach items={this.state.messages} render={function (item, index) {
                            let color = item.error ? "error" : "success"; //Alert color
                            let status = item.error ? "failed" : "completed"; //Alert status
                            let classList = classNames({
                                "siimple--p-3": true,
                                "siimple--mb-0": true,
                                "siimple--mt-2": index > 0
                            });
                            return (
                                <Alert key={index} className={classList} color={color}>
                                    <div className="siimple--text-small">
                                        <strong>{item.name}</strong> {status}.
                                    </div>
                                </Alert>
                            );
                        }} />
                        {/* No messages available */}
                        <If condition={!this.state.running && this.state.messages.length === 0}>
                            <div className="siimple--text-small siimple--text-muted" align="center">
                                <strong>No messages</strong>
                            </div>
                        </If>
                    </div>
                </If>
            </div>
        );
    }
}


