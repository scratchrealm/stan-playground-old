# stan-playground

Stan Playground is a browser-based system for creating, running, and visualizing Stan analyses. It is meant to be used primarily as a teaching tool, but it can also be used for quick prototyping and sharing of Stan models.

## Setup and installation

Stan Playground consists of multiple components that work together.

### Data directory

All data is hosted in a directory on your computer with the following structure.

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
You should create an empty `stan-playground-data` directory on your computer.

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

## Usage

### Creating a new analysis

