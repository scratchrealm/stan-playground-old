import os
import yaml
import shutil
import time
from .create_summary import create_summary
from .RtcsharePlugin import check_valid_analysis_id


def queue_analysis(analysis_id: str, *, dir: str):
    """Queue an analysis for processing"""
    try:
        check_valid_analysis_id(analysis_id)
        info_path = f'{dir}/analyses/{analysis_id}/analysis.yaml'
        if not os.path.exists(info_path):
            raise Exception(f'Analysis info file not found: {info_path}')
        with open(info_path, 'r') as f:
            text = f.read()
        info = yaml.safe_load(text)
        output_path = f'{dir}/output/{analysis_id}'
        if os.path.exists(output_path):
            shutil.rmtree(output_path)
        if info.get('status', 'none') == 'running':
            print(f'WARNING: Cannot queue analysis. Analysis is currently running: {analysis_id}')
            return
        info['status'] = 'queued'
        info['error'] = None
        info['timestamp_queued'] = time.time()
        info['timestamp_started'] = None
        info['timestamp_completed'] = None
        info['timestamp_failed'] = None
        with open(info_path, 'w') as f:
            f.write(yaml.safe_dump(info))
            print(f'Queued analysis: {analysis_id}')
    finally:
        create_summary(dir)
    