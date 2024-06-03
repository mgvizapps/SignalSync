//Create a new worker
export function createWorker (script) {
    //TODO: if script is a function --> convert to string
    return new Worker(script);
}

//Run a script or function in a worker
export function runWorker (script, data) {
    return new Promise(function (resolve, reject) {
        let worker = createWorker(script); //Initialize worker
        //Register worker message --> handle worker response
        worker.addEventListener("message", function (event) {
            worker.terminate(); //Close worker
            let data = event.data; //Get data from worker
            if (data[0] !== null) {
                return reject(data[0]); //Error running worker
            }
            //Resolve with the response of the worker
            return resolve(data[1]);
        });
        //Register worker error
        worker.addEventListener("error", function (error) {
            worker.terminate(); //Close worker
            return reject(error.message);
        });
        //Send data to worker
        return worker.postMessage(data);
    });
}

//Register a worker runner
export function registerWorker (listener) {
    return self.addEventListener("message", function (event) {
        return listener(event.data).then(function (result) {
            return self.postMessage([null, result]);
        }).catch(function (error) {
            return self.postMessage([error, null]);
        });
    });
}


