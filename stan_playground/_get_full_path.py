import os


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