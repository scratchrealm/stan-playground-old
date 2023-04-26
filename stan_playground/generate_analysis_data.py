import os
import subprocess
import time


def generate_analysis_data(analysis_id: str, *, dir: str):
    analysis_path = f'{dir}/analyses/{analysis_id}'

    data_py_path = f'{analysis_path}/data.py'
    if not os.path.exists(data_py_path):
        raise Exception(f'Unable to find data.py file for analysis {analysis_id}')
    
    # execute data.py in a separate process, writing the console output to data.console.txt, including the stderr, and waiting for return
    # we want to be in the analysis_path as the working directory
    data_console_path = f'{analysis_path}/data.console.txt'
    with open(data_console_path, 'w') as f:
        f.write(f'Executing data.py for analysis {analysis_id}\n')
        # write a timestamp line to the file
        f.write(f'{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())}\n')
        f.write(f'============================\n')
        timer = time.time()
        return_code = subprocess.call(
            ['python', 'data.py'],
            cwd=analysis_path,
            stdout=f,
            stderr=subprocess.STDOUT
        )
        elapsed = time.time() - timer
        f.write(f'============================\n')
        f.write(f'Elapsed time: {elapsed:.2f} seconds\n')
        f.write(f'Data size (bytes): {os.path.getsize(f"{analysis_path}/data.json")}\n')
        f.write(f'Return code: {return_code}\n')

    # if the return code is not zero, then raise an exception
    if return_code != 0:
        raise Exception(f'Error executing data.py for analysis {analysis_id}')
        