import os
from typing import Union, Tuple
import yaml
import random
import string
import time
import shutil
from ._get_full_path import _get_full_path


def handle_get_projects(query: dict, *, dir: str, user_id: Union[str, None], listed_only: bool, filter_by_user: Union[str, None]) -> Tuple[dict, bytes]:
    if filter_by_user is not None:
        if user_id != filter_by_user:
            raise Exception(f'Permission denied: user_id != filter_by_user ({user_id} != {filter_by_user})')
    # iterate through folders in projects directory
    projects_dir = _get_full_path(path='$dir/projects', dir=dir)
    if not os.path.isdir(projects_dir):
        os.makedirs(projects_dir)
    projects = []
    for project_id in os.listdir(projects_dir):
        # check if it is a directory
        project_dir = f'{projects_dir}/{project_id}'
        if not os.path.isdir(project_dir):
            continue
        # read the project.yaml file
        project_yaml_path = f'{project_dir}/project.yaml'
        if not os.path.isfile(project_yaml_path):
            continue
        with open(project_yaml_path, 'r') as f:
            project_yaml = yaml.safe_load(f)
        if listed_only:
            if not project_yaml.get('listed', False):
                continue
        if filter_by_user is not None:
            okay = False
            if project_yaml.get('owner_id', None) == filter_by_user:
                okay = True
            for user in project_yaml.get('users', []):
                if user.get('user_id', None) == filter_by_user:
                    okay = True
            if not okay:
                continue
        # read the description.md file
        description_path = f'{project_dir}/description.md'
        if not os.path.isfile(description_path):
            description = ''
        else:
            with open(description_path, 'r') as f:
                description = f.read()
        projects.append({
            'project_id': project_id,
            'config': project_yaml,
            'description': description
        })
    return {
        'success': True,
        'projects': projects
    }, b''

def handle_create_project(query: dict, *, dir: str, user_id: Union[str, None]) -> Tuple[dict, bytes]:
    if not user_id:
        raise Exception('Permission denied: user_id is None')
    project_id = _random_project_id(8)
    project_dir = f'{_get_full_path(path="$dir/projects", dir=dir)}/{project_id}'
    os.makedirs(project_dir)
    project_yaml = {
        'owner_id': user_id,
        'listed': False,
        'timestamp_created': time.time(),
        'timestamp_modified': time.time(),
        'users': []
    }
    with open(f'{project_dir}/project.yaml', 'w') as f:
        yaml.dump(project_yaml, f)
    # create description.md
    with open(f'{project_dir}/description.md', 'w') as f:
        f.write('# Untitled Project')
    return {
        'success': True,
        'project_id': project_id
    }, b''

def handle_delete_project(query: dict, *, dir: str, user_id: Union[str, None]) -> Tuple[dict, bytes]:
    if not user_id:
        raise Exception('Permission denied: user_id is None')
    project_id = query['project_id']
    check_valid_project_id(project_id)
    project_dir = f'{_get_full_path(path="$dir/projects", dir=dir)}/{project_id}'
    if not os.path.isdir(project_dir):
        raise Exception(f'Project does not exist: {project_id}')
    project_yaml_path = f'{project_dir}/project.yaml'
    if not os.path.isfile(project_yaml_path):
        raise Exception(f'Project config does not exist: {project_id}')
    with open(project_yaml_path, 'r') as f:
        project_yaml = yaml.safe_load(f)
    if project_yaml.get('owner_id', None) != user_id:
        raise Exception(f'Permission denied: user_id != project_yaml["owner_id"] ({user_id} != {project_yaml["owner_id"]})')
    
    # Go through the analyses and remove them from the project
    analyses_dir = f'{_get_full_path(path="$dir/analyses", dir=dir)}'
    for analysis_id in os.listdir(analyses_dir):
        analysis_dir = f'{analyses_dir}/{analysis_id}'
        if not os.path.isdir(analysis_dir):
            continue
        analysis_yaml_path = f'{analysis_dir}/analysis.yaml'
        if not os.path.isfile(analysis_yaml_path):
            continue
        with open(analysis_yaml_path, 'r') as f:
            analysis_yaml = yaml.safe_load(f)
        if analysis_yaml.get('project_id', None) == project_id:
            analysis_yaml['project_id'] = None
            with open(analysis_yaml_path, 'w') as f:
                yaml.dump(analysis_yaml, f)

    # delete the project directory
    shutil.rmtree(project_dir)
    return {'success': True}, b''

def handle_set_analysis_project(query: dict, *, dir: str, user_id: Union[str, None]) -> Tuple[dict, bytes]:
    if not user_id:
        raise Exception('Permission denied: user_id is None')
    analysis_id = query['analysis_id']
    check_valid_analysis_id(analysis_id)
    project_id = query['project_id']
    if project_id == '<None>': # sort of a hack
        project_id = None
    else:
        check_valid_project_id(project_id)
    
    analysis_dir = f'{_get_full_path(path="$dir/analyses", dir=dir)}/{analysis_id}'
    if not os.path.isdir(analysis_dir):
        raise Exception(f'Analysis does not exist: {analysis_id}')
    analysis_yaml_path = f'{analysis_dir}/analysis.yaml'
    if not os.path.isfile(analysis_yaml_path):
        raise Exception(f'Analysis config does not exist: {analysis_id}')
    with open(analysis_yaml_path, 'r') as f:
        analysis_yaml = yaml.safe_load(f)
    analysis_permission_okay = False
    if analysis_yaml.get('owner_id', None) == user_id:
        analysis_permission_okay = True
    for user in analysis_yaml.get('users', []):
        if user.get('user_id', None) == user_id:
            analysis_permission_okay = True
    if not analysis_permission_okay:
        raise Exception(f'Permission denied: user {user_id} is not in analysis {analysis_id}')
    
    project_dir = f'{_get_full_path(path="$dir/projects", dir=dir)}/{project_id}'
    if not os.path.isdir(project_dir):
        raise Exception(f'Project does not exist: {project_id}')
    project_yaml_path = f'{project_dir}/project.yaml'
    if not os.path.isfile(project_yaml_path):
        raise Exception(f'Project config does not exist: {project_id}')
    with open(project_yaml_path, 'r') as f:
        project_yaml = yaml.safe_load(f)
    project_permission_okay = False
    if project_yaml.get('owner_id', None) == user_id:
        project_permission_okay = True
    for user in project_yaml.get('users', []):
        if user.get('user_id', None) == user_id:
            project_permission_okay = True
    if not project_permission_okay:
        raise Exception(f'Permission denied: user {user_id} is not in project {project_id}')
    
    analysis_yaml['project_id'] = project_id
    with open(analysis_yaml_path, 'w') as f:
        yaml.dump(analysis_yaml, f)
    
    return {'success': True}, b''

def handle_get_project_analyses(query: dict, *, dir: str, user_id: Union[str, None]) -> Tuple[dict, bytes]:
    project_id = query['project_id']
    check_valid_project_id(project_id)

    analyses = []
    analyses_dir = f'{_get_full_path(path="$dir/analyses", dir=dir)}'
    for analysis_id in os.listdir(analyses_dir):
        analysis_dir = f'{analyses_dir}/{analysis_id}'
        if not os.path.isdir(analysis_dir):
            continue
        analysis_yaml_path = f'{analysis_dir}/analysis.yaml'
        if not os.path.isfile(analysis_yaml_path):
            continue
        with open(analysis_yaml_path, 'r') as f:
            analysis_yaml = yaml.safe_load(f)
        if analysis_yaml.get('deleted', False):
            continue
        if analysis_yaml.get('project_id', None) == project_id:
            description_path = f'{analysis_dir}/description.md'
            if not os.path.isfile(description_path):
                description = ''
            else:
                with open(description_path, 'r') as f:
                    description = f.read()
            analyses.append({
                'analysis_id': analysis_id,
                'config': analysis_yaml,
                'description': description
            })
    return {
        'success': True,
        'analyses': analyses
    }, b''

def handle_set_project_text_file(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    project_id = query['project_id']
    check_valid_project_id(project_id)
    name = query['name']
    text = query['text']

    project_dir = f'{_get_full_path(path="$dir/projects", dir=dir)}/{project_id}'
    if not os.path.isdir(project_dir):
        raise Exception(f'Project does not exist: {project_id}')
    project_yaml_path = f'{project_dir}/project.yaml'
    if not os.path.isfile(project_yaml_path):
        raise Exception(f'Project config does not exist: {project_id}')
    with open(project_yaml_path, 'r') as f:
        project_yaml = yaml.safe_load(f)
    okay_to_edit = False
    if project_yaml.get('owner_id', None) == user_id:
        okay_to_edit = True
    for user in project_yaml.get('users', []):
        if user.get('user_id', None) == user_id:
            okay_to_edit = True
    if not okay_to_edit:
        raise Exception(f'Permission denied: user {user_id} is not in project {project_id}')
    
    if name not in ['description.md']:
        raise Exception(f'Unexpected file name: {name}')
    
    with open(f'{project_dir}/{name}', 'w') as f:
        f.write(text)

    return {'success': True}, b''

def handle_set_project_listed(query: dict, *, dir: str, user_id: Union[str, None]=None) -> Tuple[dict, bytes]:
    project_id = query['project_id']
    check_valid_project_id(project_id)

    project_dir = f'{_get_full_path(path="$dir/projects", dir=dir)}/{project_id}'
    if not os.path.isdir(project_dir):
        raise Exception(f'Project does not exist: {project_id}')
    project_yaml_path = f'{project_dir}/project.yaml'
    if not os.path.isfile(project_yaml_path):
        raise Exception(f'Project config does not exist: {project_id}')
    with open(project_yaml_path, 'r') as f:
        project_yaml = yaml.safe_load(f)
    okay_to_edit = False
    if project_yaml.get('owner_id', None) == user_id:
        okay_to_edit = True
    for user in project_yaml.get('users', []):
        if user.get('user_id', None) == user_id:
            okay_to_edit = True
    if not okay_to_edit:
        raise Exception(f'Permission denied: user {user_id} is not in project {project_id}')
    
    project_yaml['listed'] = query['listed']
    with open(project_yaml_path, 'w') as f:
        yaml.dump(project_yaml, f)

    return {'success': True}, b''

def _random_project_id(num_chars: int) -> str:
    # include lowercase and digits
    return ''.join(random.choice(string.ascii_uppercase) for _ in range(num_chars))

def check_valid_analysis_id(analysis_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in analysis_id):
        raise Exception(f'Invalid analysis id: {analysis_id}')

def check_valid_project_id(project_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in project_id):
        raise Exception(f'Invalid project id: {project_id}')