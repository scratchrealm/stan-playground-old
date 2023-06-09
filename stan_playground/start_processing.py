import os
import yaml
import time
import json
import shutil
from .create_summary import create_summary
from .capture_console_output import capture_console_output, setup_logger


def start_processing(*, dir: str):
    # check that we have cmdstanpy installed
    from cmdstanpy import CmdStanModel

    create_summary(dir)

    while True:
        # iterate through all folders in the analyses directory
        analyses_dir = f'{dir}/analyses'
        if not os.path.exists(analyses_dir):
            os.makedirs(analyses_dir)
        for analysis_id in os.listdir(analyses_dir):
            analysis_dir = f'{analyses_dir}/{analysis_id}'
            analysis_output_dir = f'{dir}/output/{analysis_id}'
            info_path = f'{analysis_dir}/analysis.yaml'
            if os.path.exists(info_path):
                with open(info_path, 'r') as f:
                    info = yaml.safe_load(f.read())
                status = info.get('status', 'none')
                if status == 'queued':
                    print(f'Processing analysis: {analysis_id}')
                    info['status'] = 'running'
                    info['error'] = None
                    info['timestamp_started'] = time.time()
                    info['timestamp_completed'] = None
                    info['timestamp_failed'] = None
                    with open(info_path, 'w') as f:
                        f.write(yaml.safe_dump(info))
                    create_summary(dir)

                    # delete the output directory if it already exists
                    if os.path.exists(analysis_output_dir):
                        shutil.rmtree(analysis_output_dir)
                    # create a new output directory
                    os.makedirs(analysis_output_dir)
                    
                    try:
                        do_run_analysis(analysis_id, analysis_dir, analysis_output_dir)
                        success = True
                    except Exception as err:
                        print(f'Error running analysis: {analysis_id}')
                        print(err)
                        info['status'] = 'failed'
                        info['error'] = str(err)
                        info['timestamp_failed'] = time.time()
                        with open(info_path, 'w') as f:
                            f.write(yaml.safe_dump(info))
                        success = False
                    if success:
                        print(f'Completed analysis: {analysis_id}')
                        info['status'] = 'completed'
                        info['error'] = None
                        info['timestamp_completed'] = time.time()
                        with open(info_path, 'w') as f:
                            f.write(yaml.safe_dump(info))
                    create_summary(dir)

        # sleep for 10 seconds before checking again
        time.sleep(10)

def do_run_analysis(analysis_id: str, analysis_dir: str, analysis_output_dir: str):
    from cmdstanpy import CmdStanModel

    model_fname = f'{analysis_dir}/main.stan'

    model = CmdStanModel(stan_file=model_fname)

    # load the data from data.json
    data_fname = f'{analysis_dir}/data.json'
    with open(data_fname, 'r') as f:
        data = json.load(f)
    
    with open(f'{analysis_dir}/options.yaml', 'r') as f:
        options = yaml.safe_load(f.read())
    iter_sampling = options.get('iter_sampling', None)
    iter_warmup = options.get('iter_warmup', None)
    chains = options.get('chains', 4)
    save_warmup = options.get('save_warmup', True)
    seed = options.get('seed', None)

    if iter_sampling is None:
        raise Exception('iter_sampling not specified in options.yaml')
    if iter_warmup is None:
        raise Exception('iter_warmup not specified in options.yaml')

    # Start sampling the posterior for this model/data
    logger = setup_logger(f'{analysis_dir}/run.console.txt')
    with capture_console_output(logger):
        print(f'Starting sampling for analysis: {analysis_id}')
        # Print a timestamp
        print(f'{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())}')
        print(f'====================')
        timer = time.time()
        fit = model.sample(
            data=data,
            output_dir=analysis_output_dir,
            iter_sampling=iter_sampling,
            iter_warmup=iter_warmup,
            chains=chains,
            seed=seed,
            save_warmup=save_warmup,
            show_console=True
        )
        print(f'====================')
        elapsed = time.time() - timer
        print(f'Elapsed time: {elapsed} seconds')
        print('Finished sampling')