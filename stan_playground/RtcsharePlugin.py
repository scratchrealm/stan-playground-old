from typing import Tuple
import os
import yaml
import shutil
from .create_summary import create_summary


class RtcsharePlugin:
    def initialize(context):
        context.register_service('stan-playground', StanPlaygroundService)

class StanPlaygroundService:
    def handle_query(query: dict, *, dir: str) -> Tuple[dict, bytes]:
        type0 = query['type']
        if type0 == 'test':
            return {'success': True}, b''
        elif type0 == 'set_analysis_text_file':
            analysis_id = query['analysis_id']
            check_valid_analysis_id(analysis_id)
            name = query['name']
            text = query['text']
            if name in ['model.stan', 'data.json', 'description.md', 'options.yaml']:
                path = f'$dir/analyses/{analysis_id}/{name}'
                full_path = _get_full_path(path, dir=dir)
                with open(full_path, 'w') as f:
                    f.write(text)
                create_summary(dir=_get_full_path('$dir', dir=dir))
                return {'success': True}, b''
            else:
                raise Exception(f'Unexpected file name: {name}')
        elif type0 == 'set_analysis_status':
            analysis_id = query['analysis_id']
            check_valid_analysis_id(analysis_id)
            status = query['status']
            info = _get_analysis_info(analysis_id, dir=dir)
            current_status = info.get('status', 'none')
            if status == 'requested':
                if current_status != 'none':
                    raise Exception(f'Unable to set status to "requested" because current status is "{current_status}"')
                info['status'] = 'requested'
                info['error'] = None
                _set_analysis_info(analysis_id, info, dir=dir)
                create_summary(dir=_get_full_path('$dir', dir=dir))
                return {'success': True}, b''
            elif status == 'none':
                if not current_status in ['completed', 'failed', 'queued', 'requested']:
                    raise Exception(f'Unable to set status to "none" because current status is "{current_status}"')
                info['status'] = 'none'
                info['error'] = None
                _clear_output_for_analysis(analysis_id, dir=dir)
                _set_analysis_info(analysis_id, info, dir=dir)
                create_summary(dir=_get_full_path('$dir', dir=dir))
                return {'success': True}, b''
        else:
            raise Exception(f'Unexpected query type: {type0}')

def _get_analysis_info(analysis_id: str, *, dir: str) -> dict:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/analyses/{analysis_id}/analysis.yaml'
    full_path = _get_full_path(path, dir=dir)
    if not os.path.exists(full_path):
        return {}
    # load the yaml info
    with open(full_path, 'r') as f:
        text = f.read()
    info = yaml.safe_load(text)
    return info

def _set_analysis_info(analysis_id: str, info: dict, *, dir: str) -> None:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/analyses/{analysis_id}/analysis.yaml'
    full_path = _get_full_path(path, dir=dir)
    text = yaml.safe_dump(info)
    with open(full_path, 'w') as f:
        f.write(text)

def _clear_output_for_analysis(analysis_id: str, *, dir: str) -> None:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/output/{analysis_id}'
    full_path = _get_full_path(path, dir=dir)
    if os.path.exists(full_path):
        shutil.rmtree(full_path)

def _get_full_path(path: str, *, dir: str) -> str:
    if '..' in path: # for security
        raise Exception(f'Invalid path: {path}')
    if path == '$dir':
        path = dir
    elif path.startswith('$dir/'):
        if dir == 'rtcshare://':
            path = 'rtcshare://' + path[len("$dir/"):]
        else:
            path = f'{dir}/{path[len("$dir/"):]}'
    if not path.startswith('rtcshare://'):
        raise Exception(f'Invalid path: {path}')
    relpath = path[len('rtcshare://'):]
    fullpath = f'{os.environ["RTCSHARE_DIR"]}/{relpath}'
    return fullpath

def check_valid_analysis_id(analysis_id: str) -> None:
    return all(c.isalnum() or c == "_" for c in analysis_id)
