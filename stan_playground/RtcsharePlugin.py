from typing import Tuple, Union
from .query_handlers.project_query_handlers import handle_get_projects, handle_create_project, handle_delete_project, handle_set_analysis_project, handle_get_project_analyses, handle_set_project_text_file, handle_set_project_listed
from .query_handlers.analysis_query_handlers import handle_clone_analysis, handle_compile_analysis_model, handle_create_analysis, handle_delete_analysis, handle_generate_analysis_data, handle_set_analysis_status, handle_set_analysis_text_file, handle_undelete_analysis
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
            elif type0 == 'set_project_listed':
                return handle_set_project_listed(query, dir=dir, user_id=user_id)

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
            # elif type0 == 'set_analysis_listed':
            #     return handle_set_analysis_listed(query, dir=dir, user_id=user_id)
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