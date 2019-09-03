# Voting responsibility 

This repository contains the data, materials, figures, and analysis script for the paper "Predicting responsibility judgments from dispositional inferences and causal attributions" by Antonia Langenhoff, Alex Wiegmann, Joseph Y. Halpern, Joshua B. Tenenbaum and Tobias Gerstenberg.

Feel free to reach out in case you have any questions about the repository (email: [gerstenberg@stanford.edu](mailto:gerstenberg@stanford.edu)). 

## Project structure 

```
├── code
│   ├── R
│   │   ├── cache
│   │   └── data
│   └── experiments
│       └── experiment_2
├── data
│   ├── experiment_1
│   ├── experiment_2
│   └── experiment_3
├── docs
└── figures
    ├── diagrams
    ├── plots
    └── screenshots
        ├── experiment_1
        ├── experiment_2
        └── experiment_3
```

- `code/experiments/experiment_2/`: experiment code for experiment 2 which was run using [psiturk](https://psiturk.org) version 2.3.0
- `code/R/`: RMarkdown document with the analysis code 
- `data/`: experiment data for each of the three experiments reported in the paper 
- `docs/index.html`html file based on the rendered RMarkdown document 
	+ you can view the analysis code in your browser [here](https://cicl-stanford.github.io/voting_responsibility/)
- `figures/`: diagram, results figures, and experiment screenshots 
	+ experiments 1 and 3 were run in Qualtrics, so the full survey printout is provided
