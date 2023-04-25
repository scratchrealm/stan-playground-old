# stan-playground

Stan Playground is a browser-based system for creating, running, and visualizing Stan analyses. It can be used as a teaching tool or for quick prototyping and sharing of models. One of its primary objectives is to facilitate the development of [MCMC Monitor](https://github.com/flatironinstitute/mcmc-monitor) by providing an easy way to generate a variety of examples in a collaborative environment.

## Overview

A Stan Playground instance consists of a collection of analyses. Each analysis consists of the following:

* An analysis ID (`0001`, `0002`, etc.)
* A Stan model (`model.stan`)
* A data file (`data.json`)
* A description (`description.md`) - the first heading is the analysis title
* An options file (`options.yaml`) - determines number of iterations, etc.
* The output from the analysis which can be monitored using the MCMC-Monitor tool

These data are all stored in a directory on your computer (or the computer of the person hosting the instance), with the following structure:

```bash
stan-playground-data
├── analyses
│   ├── 0001
│   │   ├── model.stan
│   │   ├── data.json
│   │   └── description.md
│   │   └── options.yaml
│   │   └── analysis.yaml
│   ├── 0002
│   └── ...
├── output # monitored by MCMC-Monitor
│   ├── 0001
│   │   ├── The output from cmdstan
│   │   └── ...
│   ├── 0002
│   └── ...
```

The directory is monitored by a background service that automatically runs analyses as they are created or modified through the web interface. The output from the runs is stored in a separate directory and can be viewed using MCMC Monitor.

An instance of the system comprises the following components:

* The data directory, served by an [rtcshare daemon](https://github.com/scratchrealm/rtcshare).
* An installed Python package that provides a command-line interface for managing the analyses and running the background service.
* A web application that provides a graphical user interface for creating, editing, and running analyses.
* An MCMC Monitor service that monitors the output directory and provides a graphical user interface for viewing the output of the analyses.

## Usage

For this section we assume you have either set up your own instance of Stan Playground (see below), or have access to a hosted instance.

**Creating a new analysis**

To create a new analysis, click the `Create new analysis` link above the main analyses table in the web application. This will create a new analysis with a unique ID and open the editor for the analysis.

**Editing an analysis**

To edit an analysis, click on the analysis ID in the main analyses table. This will open the editor for the analysis. You will then be able to edit the model, data, description, and options for the analysis. Typically you would prepare the model.stan and data.json files separately and paste them in to the viewer.

Note that the model, data, and options can only be edited if the status is "none", meaning that the analysis has not yet been run, queued, or requested for running. However, you can edit the description at any time.

**Running an analysis**

For security reasons, analysis runs cannot be queued directly from the web interface. Instead, you can tag an analysis as "requested" using the "Request run" button in the web interface. Then, the administrator can choose to queue that analysis for running using the command-line interface:

```bash
# replace 0001 by the analysis ID
stan-playground queue 0001
```

**Canceling a run**

You can cancel a run for an analysis that has a status of `requested` or `queued` using the appropriate button on the web interface.

**Deleting a run**

You can delete a run for an analysis that has a status of `completed` or `failed` using the appropriate button on the web interface. Note however that you cannot delete an actively running analysis (status is `running`). Note that deleting a run is not the same as deleting an analysis.

**Deleting an analysis**

You can delete an analysis using the appropriate button on the web interface. This will delete all files associated with the analysis, and remove the folder as well as the corresponding output folder if it exists. Note that deleting an analysis is not the same as deleting a run.

**Viewing the output of a run**

The output of a run can be viewed using the MCMC Monitor tool. To do this, click on the "MCMC Monitor" link in the main analyses table. You can monitor an ongoing run and you can also visualize the output of a completed or failed run.

**Clone an analysis**

You can clone an analysis using the appropriate button on the web interface when editing the analysis. This will create a new analysis with the same model, data, description, and options as the original analysis. The new analysis will have a new ID.

## Setup and installation

As described above, Stan Playground consists of multiple components that work together.

### Data directory

All data is hosted in a directory on your computer with the structure shown above. You should create an empty `stan-playground-data` directory on your computer.

### Python package

The Python package can be installed by cloning this repository and then running

```bash
cd stan-playground
pip install -e .

# periodically update the package
git pull
pip install -e .
```

Start the background service by running

```bash
cd stan-playground-data
stan-playground start

# This is the service that will monitor the analyses directory for changes
# and automatically run the requested analyses.
```

### Rtcshare

In order for the browser to be able to access the data from your computer, you will need to run an rtcshare daemon.

```bash
# Install rtcshare
pip install rtcshare
```

```bash
# Start the rtcshare daemon with the stan_playground plugin
cd stan-playground-data
rtcshare start --dir . --plugins stan_playground
```

### Web application

The web application is hosted on GitHub pages (https://scratchrealm.github.com/stan-playground). It can also be run locally for development purpose. The source code can be found in the `gui` directory.

To view the web application, navigate to the following URL in your browser.

```
https://figurl.org/f?v=https://scratchrealm.github.io/stan-playground&label=stan-playground&sh=http://localhost:61752&dir=rtcshare://
```

This is assuming you are connecting to a locally-running rtcshare service. To connect to a remote service, you would replace the value of the `sh` parameter with the URL of the remote rtcshare service.

### MCMC Monitor

In order to enable visualization of the output, you need to run the MCMC Monitor service on the output directory.

```bash
cd stan-playground-data/output
npx mcmc-monitor@latest start --dir . --verbose
# optionally add the --enable-remote-access flag to allow remote access
```

Then you must create a file:

```
stan-playground-data/output/mcmc-monitor-url.txt
```

with the content of the URL for the MCMC Monitor service. This could either be a local or a remote URL.

## Authentication and authorization

For now, the system does not support authentication and authorization. This means that anyone who has access to the web application can create, edit, and delete analyses. This is fine for a local instance of the system, but not for a hosted instance. Therefore, future versions of the system will support authentication and authorization, probably using GitHub OAuth.

## License

Stan Playground is licensed under the Apache License, Version 2.0. See LICENSE for the full license text.

## Authors

Jeremy Magland, Center for Computational Mathematics, Flatiron Institute