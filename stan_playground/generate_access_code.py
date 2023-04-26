import os
import json
import random
import string
import time


def generate_access_code(*, dir: str) -> str:
    # check whether the analyses subdirectory exists
    # if not, then we are probably not in the right directory
    if not os.path.exists(f'{dir}/analyses'):
        raise Exception('You must be in the root of the stan playground data directory.')

    # load the existing access_codes from the .access_codes.json file, if it exists
    access_codes = []
    if os.path.exists(f'{dir}/.access_codes.json'):
        with open(f'{dir}/.access_codes.json') as f:
            access_codes = json.load(f)
    
    # filter this to only include the access_codes that have not yet expired
    current_timestamp = int(time.time())
    access_codes = [p for p in access_codes if get_expiration_timestamp(p) > current_timestamp]

    # generate a new access_code
    new_access_code = create_access_code(60 * 60) # one hour for now

    # add the new access_code to the list
    access_codes.append(new_access_code)

    # save the list of access_codes back to the .access_codes.json file
    with open(f'{dir}/.access_codes.json', 'w') as f:
        json.dump(access_codes, f)
    
    # return the new access_code
    return new_access_code

def check_valid_access_code(access_code: str, *, dir: str) -> bool:
    # load the existing access_codes from the .access_codes.json file, if it exists
    access_codes = []
    if os.path.exists(f'{dir}/.access_codes.json'):
        with open(f'{dir}/.access_codes.json') as f:
            access_codes = json.load(f)
    
    # filter this to only include the access_codes that have not yet expired
    current_timestamp = int(time.time())
    access_codes = [p for p in access_codes if get_expiration_timestamp(p) > current_timestamp]

    # check if the access_code is in the list
    return access_code in access_codes

def create_access_code(expiration_sec: int):
    expiration_timestamp = int(time.time()) + expiration_sec
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
    return f'{random_str}.{expiration_timestamp}'

def get_expiration_timestamp(access_code: str):
    return int(access_code.split('.')[1])