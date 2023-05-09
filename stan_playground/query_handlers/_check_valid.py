def check_valid_analysis_id(analysis_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in analysis_id):
        raise Exception(f'Invalid analysis id: {analysis_id}')

def check_valid_project_id(project_id: str) -> None:
    if not all(c.isalnum() or c == "_" for c in project_id):
        raise Exception(f'Invalid project id: {project_id}')