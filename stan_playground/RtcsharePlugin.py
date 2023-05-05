from typing import Tuple, Union
import os
import yaml
import shutil
import time
import random
import string
from .create_summary import create_summary
from .generate_access_code import check_valid_access_code
from .generate_analysis_data import generate_analysis_data
from .compile_analysis_model import compile_analysis_model
from .project_query_handlers import handle_get_projects, handle_create_project, handle_delete_project, handle_set_analysis_project, handle_get_project_analyses, handle_set_project_text_file
from .project_query_handlers import check_valid_project_id
from ._get_full_path import _get_full_path


class RtcsharePlugin:
    def initialize(context):
        context.register_service('stan-playground', StanPlaygroundService)

class StanPlaygroundService:
    def handle_query(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
        print(f'Request from user: {user_id}')
        type0 = query['type']
        
        try:
            if type0 == 'test':
                return {'success': True}, b''
            elif type0 == 'get_listed_projects':
                return handle_get_projects(query, dir=dir, user_id=user_id, listed_only=True, filter_by_user=None)
            elif type0 == 'get_projects_for_user':
                return handle_get_projects(query, dir=dir, user_id=user_id, listed_only=False, filter_by_user=user_id)
            elif type0 == 'create_project':
                return handle_create_project(query, dir=dir, user_id=user_id)
            elif type0 == 'delete_project':
                return handle_delete_project(query, dir=dir, user_id=user_id)
            elif type0 == 'set_analysis_project':
                return handle_set_analysis_project(query, dir=dir, user_id=user_id)
            elif type0 == 'get_project_analyses':
                return handle_get_project_analyses(query, dir=dir, user_id=user_id)
            elif type0 == 'set_project_text_file':
                return handle_set_project_text_file(query, dir=dir, user_id=user_id)
            elif type0 == 'set_analysis_text_file':
                return handle_set_analysis_text_file(query, dir=dir, user_id=user_id)
            elif type0 == 'set_analysis_status':
                return handle_set_analysis_status(query, dir=dir, user_id=user_id)
            elif type0 == 'clone_analysis':
                return handle_clone_analysis(query, dir=dir, user_id=user_id)
            elif type0 == 'delete_analysis':
                return handle_delete_analysis(query, dir=dir, user_id=user_id)
            elif type0 == 'undelete_analysis':
                return handle_undelete_analysis(query, dir=dir, user_id=user_id)
            elif type0 == 'set_analysis_listed':
                return handle_set_analysis_listed(query, dir=dir, user_id=user_id)
            elif type0 == 'create_analysis':
                return handle_create_analysis(query, dir=dir, user_id=user_id)
            elif type0 == 'generate_analysis_data':
                return handle_generate_analysis_data(query, dir=dir, user_id=user_id)
            elif type0 == 'compile_analysis_model':
                return handle_compile_analysis_model(query, dir=dir, user_id=user_id)
            else:
                raise Exception(f'Unexpected query type: {type0}')
        except Exception as e:
            return {'success': False, 'error': str(e)}, b''

def handle_set_analysis_text_file(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)
    name = query['name']
    text = query['text']

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')

    if name in ['model.stan', 'data.json', 'description.md', 'options.yaml', 'data.py']:
        path = f'$dir/analyses/{analysis_id}/{name}'
        full_path = _get_full_path(path, dir=dir)
        with open(full_path, 'w') as f:
            f.write(text)
        info['timestamp_modified'] = time.time()
        _set_analysis_info(analysis_id, info, dir=dir)
        create_summary(dir=_get_full_path('$dir', dir=dir))
        return {'success': True}, b''
    else:
        raise Exception(f'Unexpected file name: {name}')

def handle_set_analysis_status(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)
    status = query['status']

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')
        
    current_status = info.get('status', 'none')
    if status == 'queued':
        if current_status != 'none':
            raise Exception(f'Unable to set status to "queued" because current status is "{current_status}"')
        
        info['status'] = 'queued'
        info['error'] = None
        info['timestamp_queued'] = time.time()
        info['timestamp_modified'] = time.time()
        _set_analysis_info(analysis_id, info, dir=dir)
        create_summary(dir=_get_full_path('$dir', dir=dir))
        return {'success': True}, b''
    elif status == 'none':
        if not current_status in ['completed', 'failed', 'queued']:
            raise Exception(f'Unable to set status to "none" because current status is "{current_status}"')
        info['status'] = 'none'
        info['error'] = None
        info['timestamp_queued'] = None
        info['timestamp_started'] = None
        info['timestamp_completed'] = None
        info['timestamp_failed'] = None
        info['timestamp_modified'] = time.time()
        _clear_run_console_for_analysis(analysis_id, dir=dir)
        _clear_output_for_analysis(analysis_id, dir=dir)
        _set_analysis_info(analysis_id, info, dir=dir)
        create_summary(dir=_get_full_path('$dir', dir=dir))
        return {'success': True}, b''
    else:
        raise Exception(f'Unexpected status for set_analysis status: {status}')

def handle_clone_analysis(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)
    new_analysis_id = _random_id(8)
    path = _get_full_path(f'$dir/analyses/{analysis_id}', dir=dir)
    path_new = _get_full_path(f'$dir/analyses/{new_analysis_id}', dir=dir)
    shutil.copytree(path, path_new)
    if os.path.exists(f'{path_new}/analysis.yaml'):
        os.remove(f'{path_new}/analysis.yaml')
    if os.path.exists(f'{path_new}/.edit_token'):
        os.remove(f'{path_new}/.edit_token')
    x = {
        'status': 'none',
        'owner_id': user_id,
        'timestamp_created': time.time(),
        'timestamp_modified': time.time(),
        'listed': False
    }
    with open(f'{path_new}/analysis.yaml', 'w') as f:
        yaml.dump(x, f)
    edit_token = _random_token(12)
    with open(f'{path_new}/.edit_token', 'w') as f:
        f.write(edit_token)

    # replace the title in description.md by one where "copy" is concatenated to the title
    with open(f'{path_new}/description.md', 'r') as f:
        text = f.read()
    lines = text.split('\n')
    if lines[0].startswith('#'):
        lines[0] = lines[0] + ' copy'
    text = '\n'.join(lines)
    with open(f'{path_new}/description.md', 'w') as f:
        f.write(text)

    create_summary(dir=_get_full_path('$dir', dir=dir))
    return {'success': True, 'newAnalysisId': new_analysis_id, 'editToken': edit_token}, b''

def handle_delete_analysis(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')

    info['deleted'] = True
    _set_analysis_info(analysis_id, info, dir=dir)
    create_summary(dir=_get_full_path('$dir', dir=dir))
    return {'success': True}, b''

def handle_undelete_analysis(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')

    info['deleted'] = False
    _set_analysis_info(analysis_id, info, dir=dir)
    create_summary(dir=_get_full_path('$dir', dir=dir))
    return {'success': True}, b''

def handle_set_analysis_listed(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)

    if not user_id:
        raise Exception('You must be logged in to list this analysis')

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')
    
    if info.get('owner_id', None):
        if info['owner_id'] != user_id:
            raise Exception(f'This analysis is not owned by you, so you cannot list it.')
        
    info['owner_id'] = user_id
    info['listed'] = query['listed']
    _set_analysis_info(analysis_id, info, dir=dir)
    create_summary(dir=_get_full_path('$dir', dir=dir))
    return {'success': True}, b''

def handle_create_analysis(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    project_id = query.get('project_id', None)
    if project_id is not None:
        check_valid_project_id(project_id)

    new_analysis_id = _random_id(8)
    path = _get_full_path(f'$dir/analyses/{new_analysis_id}', dir=dir)
    os.makedirs(path)
    with open(f'{path}/model.stan', 'w') as f:
        f.write('// Stan model goes here')
    with open(f'{path}/data.json', 'w') as f:
        f.write('{}')
    with open(f'{path}/description.md', 'w') as f:
        f.write('# Untitled')
    with open(f'{path}/options.yaml', 'w') as f:
        f.write('iter_sampling: 200\niter_warmup: 20\n')
    x = {
        'status': 'none',
        'owner_id': user_id,
        'project_id': project_id,
        'timestamp_created': time.time(),
        'timestamp_modified': time.time(),
        'listed': False
    }
    with open(f'{path}/analysis.yaml', 'w') as f:
        yaml.dump(x, f)
    edit_token = _random_token(12)
    with open(f'{path}/.edit_token', 'w') as f:
        f.write(edit_token)
    create_summary(dir=_get_full_path('$dir', dir=dir))
    return {'success': True, 'newAnalysisId': new_analysis_id, 'editToken': edit_token}, b''

def handle_generate_analysis_data(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)

    info = _get_analysis_info(analysis_id, dir=dir)
    analysis_edit_token = _get_analysis_edit_token(analysis_id, dir=dir)
    if not _can_edit_analysis(analysis_info=info, user_id=user_id, analysis_edit_token=analysis_edit_token, query=query):
        raise Exception('Not authorized to edit this analysis.')

    # This is very important because we don't want unauthorized execution of Python code.
    access_code = query.get('access_code', '')
    if not check_valid_access_code(access_code, dir=_get_full_path('$dir', dir=dir)):
        return {'success': False, 'error': 'Invalid access code'}, b''
    
    try:
        generate_analysis_data(analysis_id, dir=_get_full_path('$dir', dir=dir))
    except Exception as e:
        return {'success': False, 'error': str(e)}, b''
    
    info['timestamp_modified'] = time.time()
    _set_analysis_info(analysis_id, info, dir=dir)
                
    return {'success': True}, b''

def handle_compile_analysis_model(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)
    
    compile_analysis_model(analysis_id, dir=_get_full_path('$dir', dir=dir))
    
    return {'success': True}, b''

# def _get_new_analysis_id(*, dir: str) -> str:
#     i = 1
#     while True:
#         # candidate analysis id is 0001, 0002, etc.
#         analysis_id = f'{i:04d}'
#         path = f'{dir}/analyses/{analysis_id}'
#         if not os.path.exists(path):
#             return analysis_id
#         i += 1
#         if i > 9999:
#             raise Exception('Unable to find a new analysis id')

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

def _get_analysis_edit_token(analysis_id: str, *, dir: str) -> str:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/analyses/{analysis_id}/.edit_token'
    full_path = _get_full_path(path, dir=dir)
    if not os.path.exists(full_path):
        return ''
    with open(full_path, 'r') as f:
        edit_token = f.read()
    return edit_token

def _set_analysis_info(analysis_id: str, info: dict, *, dir: str) -> None:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/analyses/{analysis_id}/analysis.yaml'
    full_path = _get_full_path(path, dir=dir)
    text = yaml.safe_dump(info)
    with open(full_path, 'w') as f:
        f.write(text)

def _clear_run_console_for_analysis(analysis_id: str, *, dir: str) -> None:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/analyses/{analysis_id}/run.console.txt'
    full_path = _get_full_path(path, dir=dir)
    if os.path.exists(full_path):
        os.remove(full_path)

def _clear_output_for_analysis(analysis_id: str, *, dir: str) -> None:
    # for security, ensure that analysis_id is a valid id
    check_valid_analysis_id(analysis_id)
    path = f'$dir/output/{analysis_id}'
    full_path = _get_full_path(path, dir=dir)
    if os.path.exists(full_path):
        shutil.rmtree(full_path)

def check_valid_analysis_id(analysis_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in analysis_id):
        raise Exception(f'Invalid analysis id: {analysis_id}')

def _can_edit_analysis(*, analysis_info: dict, user_id: str, analysis_edit_token: str, query: dict):
    analysis_owner_id = analysis_info.get('owner_id', analysis_info.get('user_id', None))
    if analysis_owner_id:
        if user_id != analysis_owner_id:
            raise Exception(f'User is not authorized to edit this analysis.')
    else:
        if not analysis_edit_token:
            raise Exception(f'Not authorized to edit this anonymous analysis (unexpected: no analysis edit token).')
        edit_token = query.get('edit_token', None)
        if edit_token != analysis_edit_token:
            raise Exception(f'Not authorized to edit this anonymous analysis.')
    return True

def _random_token(num_chars: int) -> str:
    # only include lowercase characters
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(num_chars))

def _random_id(num_chars: int) -> str:
    # include lowercase and digits
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(num_chars))