import os
import yaml
import shutil
from .RtcsharePlugin import check_valid_analysis_id


def queue_analysis(analysis_id: str, *, dir: str):
    """Queue an analysis for processing"""
    check_valid_analysis_id(analysis_id)
    config_path = f'{dir}/analyses/{analysis_id}/analysis.yaml'
    if not os.path.exists(config_path):
        raise Exception(f'Analysis config file not found: {config_path}')
    with open(config_path, 'r') as f:
        text = f.read()
    config = yaml.safe_load(text)
    output_path = f'{dir}/output/{analysis_id}'
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    if config.get('status', 'none') == 'running':
        print(f'WARNING: Cannot queue analysis. Analysis is currently running: {analysis_id}')
        return
    config['status'] = 'queued'
    with open(config_path, 'w') as f:
        f.write(yaml.safe_dump(config))
        print(f'Queued analysis: {analysis_id}')
    