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
                info['timestamp_queued'] = None
                info['timestamp_started'] = None
                info['timestamp_completed'] = None
                info['timestamp_failed'] = None
                _clear_output_for_analysis(analysis_id, dir=dir)
                _set_analysis_info(analysis_id, info, dir=dir)
                create_summary(dir=_get_full_path('$dir', dir=dir))
                return {'success': True}, b''
        elif type0 == 'clone_analysis':
            analysis_id = query['analysis_id']
            new_analysis_id = _get_new_analysis_id(dir=_get_full_path('$dir', dir=dir))
            path = _get_full_path(f'$dir/analyses/{analysis_id}', dir=dir)
            path_new = _get_full_path(f'$dir/analyses/{new_analysis_id}', dir=dir)
            shutil.copytree(path, path_new)
            if os.path.exists(f'{path_new}/analysis.yaml'):
                os.remove(f'{path_new}/analysis.yaml')
            create_summary(dir=_get_full_path('$dir', dir=dir))
            return {'newAnalysisId': new_analysis_id}, b''
        elif type0 == 'delete_analysis':
            analysis_id = query['analysis_id']
            path = _get_full_path(f'$dir/analyses/{analysis_id}', dir=dir)
            shutil.rmtree(path)
            output_path = _get_full_path(f'$dir/output/{analysis_id}', dir=dir)
            if os.path.exists(output_path):
                shutil.rmtree(output_path)
            create_summary(dir=_get_full_path('$dir', dir=dir))
            return {'success': True}, b''
        elif type0 == 'create_analysis':
            new_analysis_id = _get_new_analysis_id(dir=_get_full_path('$dir', dir=dir))
            path = _get_full_path(f'$dir/analyses/{new_analysis_id}', dir=dir)
            os.mkdir(path)
            with open(f'{path}/model.stan', 'w') as f:
                f.write('// Stan model goes here')
            with open(f'{path}/data.json', 'w') as f:
                f.write('{}')
            with open(f'{path}/description.md', 'w') as f:
                f.write('# Untitled')
            with open(f'{path}/options.yaml', 'w') as f:
                f.write('iter_sampling: 200\niter_warmup: 20\n')
            with open(f'{path}/analysis.yaml', 'w') as f:
                f.write('status: none\n')
            create_summary(dir=_get_full_path('$dir', dir=dir))
            return {'newAnalysisId': new_analysis_id}, b''
        else:
            raise Exception(f'Unexpected query type: {type0}')

def _get_new_analysis_id(*, dir: str) -> str:
    i = 1
    while True:
        # candidate analysis id is 0001, 0002, etc.
        analysis_id = f'{i:04d}'
        path = f'{dir}/analyses/{analysis_id}'
        if not os.path.exists(path):
            return analysis_id
        i += 1
        if i > 9999:
            raise Exception('Unable to find a new analysis id')

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
