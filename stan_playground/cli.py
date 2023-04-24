from typing import List
import click
import stan_playground


@click.group(help="stan-playground command line client")
def cli():
    pass

@click.command(help="Queue one or more sessions for processing")
@click.argument('analysis_ids', nargs=-1)
def queue(analysis_ids: List[str]):
    if len(analysis_ids) == 0:
        raise Exception('No analysis ids specified')
    for analysis_id in analysis_ids:
        stan_playground.queue_analysis(analysis_id, dir='.')

@click.command(help="Start the processing")
def start():
    stan_playground.start_processing(dir='.')

cli.add_command(queue)
cli.add_command(start)