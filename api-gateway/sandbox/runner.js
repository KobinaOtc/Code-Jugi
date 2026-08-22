const { exec } = require('child_process');
const { performance } = require('perf_hooks');

// The API Gateway will pass the file paths when it starts the container
const codePath = process.argv[2];
const inputPath = process.argv[3];

// 1. Start the stopwatch
const start = performance.now();

// 2. Execute the user's code and feed it the test case input
// We enforce a hard 2-second timeout here as our first line of defense against infinite loops
const command = `node ${codePath} < ${inputPath}`;

exec(command, { timeout: 2000 }, (error, stdout, stderr) => {
    // 3. Stop the stopwatch
    const end = performance.now();
    const runtimeMs = Math.round(end - start);

    // 4. Package the results into a clean report
    const result = {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        // If the code timed out or crashed, we capture the reason here
        error: error ? error.message : null, 
        runtime: runtimeMs
    };

    // 5. Print the JSON string so our API Gateway can read it
    console.log(JSON.stringify(result));
});