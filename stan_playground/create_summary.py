import os
import json
import yaml


def create_summary(dir: str):
    if not os.path.exists(f'{dir}/analyses'):
        os.makedirs(f'{dir}/analyses')

    analyses = []
    # Iterate through all the folders in the analyses directory
    folders = os.listdir(f'{dir}/analyses')
    folders.sort()
    for folder in folders:
        path = f'{dir}/analyses/{folder}'

        # read info from analysis.yaml file
        if os.path.exists(f'{path}/analysis.yaml'):
            with open(f'{path}/analysis.yaml') as f:
                info = yaml.load(f, Loader=yaml.FullLoader)
        else:
            info = {}
        
        # if deleted, skip
        if info.get('deleted', False):
            continue

        # read description from description.md file
        if os.path.exists(f'{path}/description.md'):
            with open(f'{path}/description.md') as f:
                description = f.read()
        else:
            description = ''
        
        # read options from options.yaml file
        if os.path.exists(f'{path}/options.yaml'):
            with open(f'{path}/options.yaml') as f:
                options = yaml.load(f, Loader=yaml.FullLoader)
        else:
            options = {}

        # read stan program from model.stan file
        if os.path.exists(f'{path}/model.stan'):
            with open(f'{path}/model.stan') as f:
                stan_program = f.read()
        else:
            stan_program = ''
        
        # read python program from data.py file
        if os.path.exists(f'{path}/data.py'):
            with open(f'{path}/data.py') as f:
                data_python_program = f.read()
        else:
            data_python_program = ''
        
        title = _get_title_from_markdown(description)
        analyses.append({
            'analysis_id': folder,
            'title': title,
            'status': info.get('status', 'none'),
            'user_id': info.get('user_id', None),
            'data_size': os.path.getsize(f'{path}/data.json') if os.path.exists(f'{path}/data.json') else 0,
            'info': info,
            'description': description,
            'stan_program': stan_program,
            'data_python_program': data_python_program,
            'options': options
        })

    summary = {
        'analyses': analyses
    }
    
    # write analyses to stan_playground_summary.json file
    with open(f'{dir}/stan_playground_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

def _get_title_from_markdown(markdown: str):
    # Extract the title from the markdown
    lines = markdown.split('\n')
    for line in lines:
        if line.startswith('#'):
            # skip all the initial # characters
            return line.lstrip('#').strip()
    return ''