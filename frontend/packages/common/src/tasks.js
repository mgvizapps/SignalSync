import kofi from "kofi";

//Export task queue class
export class TasksQueue {
    constructor() {
        this.running = false; //Tasks not running
        this.tasks = []; //Empty tasks list
        this.runners = {}; //Tasks runners
        this.dispatcher = kofi.dispatch();
    }
    //Register a new tasks runner
    addRunner(name, listener) {
        this.runners[name] = listener;
    }
    //Add a new task
    addTask(type, name, args) {
        let id = kofi.tempid(); //Generate an id for this task
        this.tasks.push({"id": id, "type": type, "name": name, "args": args});
        this.startQueue(); //Start the queue
        return Promise.resolve(id);
    }
    //Abort task
    abortTask(id) {
        //TODO: abort task
    }
    //Start the queue
    startQueue() {
        let self = this;
        //Check if queue is running
        if (this.running === true || this.tasks.length === 0) {
            return null;
        }
        //Set as running
        this.running = true;
        let task = this.tasks.shift(); //Get next task
        //console.log(`RUNNING TASK ${task.id}`);
        //console.log(task);
        if (typeof this.runners[task.type] !== "function") {
            //TODO: display error
            return this.endQueue(); //Next task
        }
        this.dispatcher.emit("start", task); //.type, task.name, task.args);
        //Run this task
        return this.runners[task.type](task.args, function () {
            self.dispatcher.emit("end", task); //.type, task.name, task.args);
            return self.endQueue(); //Next task
        });
    }
    //End queue
    endQueue() {
        this.running = false; //Disable running
        //console.log("END TASKS");
        //Check if there are more tasks to run
        if (this.tasks.length > 0) {
            return this.startQueue(); //Run next task
        }
    }
    //Register an event listener
    addEventListener(name, listener) {
        this.dispatcher.addListener(name, listener);
    }
    //Remove an event listener
    removeEventListener(name, listener) {
        this.dispatcher.removeListener(name, listener);
    }
}

//Global tasks queue
export const tasks = new TasksQueue();

