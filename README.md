# Voting responsibility 

This repository contains the data, materials, figures, and analysis script for the paper "Predicting responsibility judgments from dispositional inferences and causal attributions" by Antonia Langenhoff, Alex Wiegmann, Joseph Y. Halpern, Joshua B. Tenenbaum and Tobias Gerstenberg.

Feel free to reach out in case you have any questions about the repository (email: [gerstenberg@stanford.edu](mailto:gerstenberg@stanford.edu)). 

## Project structure 

```
.
├── code
│   ├── R
│   │   ├── cache
│   │   ├── data
│   │   └── voting_responsibility_analysis_files
│   └── experiments
│       ├── psiturk
│       └── qualtrics
├── data
│   ├── experiment_1
│   ├── experiment_2
│   ├── experiment_3
│   └── experiment_4
├── docs
└── figures
    ├── diagrams
    ├── experiment_sreenshots
    │   ├── experiment_1
    │   ├── experiment_2
    │   ├── experiment_3
    │   └── experiment_4
    └── plots
```

- `code/R/`: RMarkdown document with the analysis code 
- `code/experiments/`: 
	+ `psiturk`: experiment code for experiment 2 which was run using [psiturk](https://psiturk.org)
	+ `qualtrics`: qualtrics file for experiment 1 and 4 
- `data/`: experiment data for each of the four experiments reported in the paper 
- `docs/index.html`html file based on the rendered RMarkdown document 
	+ you can view the analysis code in your browser [here](https://cicl-stanford.github.io/voting_responsibility/)
- `figures/`: diagrams, plots, and experiment screenshots 
	+ experiments 1, 3, and 4 were run in Qualtrics, so the full survey printout is provided
