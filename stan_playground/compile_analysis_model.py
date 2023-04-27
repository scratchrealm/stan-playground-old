import os
import subprocess
import time


def compile_analysis_model(analysis_id: str, *, dir: str):
    analysis_path = f'{dir}/analyses/{analysis_id}'

    model_stan_path = f'{analysis_path}/model.stan'
    if not os.path.exists(model_stan_path):
        raise Exception(f'Unable to find model.stan file for analysis {analysis_id}')
    
    # Run compilation in a separate process, writing the console output to compile.console.txt, including the stderr, and waiting for return
    # we want to be in the analysis_path as the working directory
    compile_console_path = f'{analysis_path}/compile.console.txt'
    if os.path.exists(compile_console_path):
        os.remove(compile_console_path)
    with open(compile_console_path, 'w') as f:
        f.write(f'Starting compilation for analysis {analysis_id}\n')
        # write a timestamp line to the file
        f.write(f'{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())}\n')
        f.write(f'============================\n')
        timer = time.time()
        return_code = subprocess.call(
            ['cmdstan_model', 'model.stan'],
            cwd=analysis_path,
            stdout=f,
            stderr=subprocess.STDOUT
        )
        elapsed = time.time() - timer
        f.write(f'============================\n')
        f.write(f'Elapsed time: {elapsed:.2f} seconds\n')
        f.write(f'Executable size (bytes): {os.path.getsize(f"{analysis_path}/model")}\n')
        f.write(f'Return code: {return_code}\n')

    # if the return code is not zero, then raise an exception
    if return_code != 0:
        raise Exception(f'Error compiling model for analysis {analysis_id}')