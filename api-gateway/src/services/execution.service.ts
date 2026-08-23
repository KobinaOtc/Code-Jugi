import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Initialize the Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const executeCode = async (code: string, input: string) => {
  // 1. Create a unique identifier for this run to avoid file name collisions
  const runId = crypto.randomBytes(16).toString('hex');
  const tempDir = path.join(__dirname, '../../temp_execution', runId);

  try {
    // 2. Create the temporary directory
    await fs.mkdir(tempDir, { recursive: true });

    // 3. Write the code and the test input to temporary files
    const codePath = path.join(tempDir, 'solution.js');
    const inputPath = path.join(tempDir, 'input.txt');
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input);

    // 4. Configure the Docker container
    // We bind the temporary directory from our host machine to a folder inside the container
    // This allows the container to read the files we just created
    const container = await docker.createContainer({
      Image: 'code-jugi-js-runner',
      Cmd: ['node', '/app/runner.js', '/workspace/solution.js', '/workspace/input.txt'],
      HostConfig: {
        Binds: [`${tempDir}:/workspace`], 
        Memory: 256 * 1024 * 1024, 
        NetworkMode: 'none', 
        // 🔒 NEW: Prevents fork bombs by limiting the container to 64 processes
        PidsLimit: 64, 
        // 🔒 NEW: Prevents the container from gaining new permissions during runtime
        SecurityOpt: ['no-new-privileges'],
      },
    });

    // 5. Start the container and wait for it to finish
    await container.start();
    const result = await container.wait();

    // 6. Capture the output from the container
    const logs = await container.logs({ stdout: true, stderr: true });

    // Docker adds 8 bytes of metadata to the start of each log line. We need to strip it.
    const outputBuffer = Buffer.from(logs.toString('binary'), 'binary');
    let outputString = '';
    let offset = 0;
    while (offset < outputBuffer.length) {
      const length = outputBuffer.readUInt32BE(offset + 4);
      outputString += outputBuffer.toString('utf8', offset + 8, offset + 8 + length);
      offset += 8 + length;
    }

    // 7. Clean up the container
    await container.remove();

    // Parse the JSON string our runner.js script produced
    const parsedResult = JSON.parse(outputString);
    
    // Check if the container crashed (e.g. ran out of memory)
    if (result.StatusCode !== 0 && !parsedResult.error) {
       parsedResult.error = "Container exited abnormally. Possible memory limit exceeded.";
    }

    return parsedResult;

  } catch (error) {
    console.error('Execution Error:', error);
    return { error: 'Internal system error during execution' };
  } finally {
    // 8. Always delete the temporary files, even if the code crashes
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};