# Run instructions

Read the following so as to run the different parts of the project.

## EDA - Olympics Data Analysis

All the code is placed in the `eda/` folder.

##### 1. Create an environment and install the dependencies
```sh
pip install -r requirements.txt
```

##### 2. Run the notebook `eda.ipynb`.
It will download the data by itself and save it in the `eda/data/` folder.

## Website - Olympics Data Visualization

You can set up a development server with the following commands. 

##### 1. Install the dependencies
```sh
npm install
```

##### 2. Run the development server

For development purposes, you can run the development server either with or without the **introduction animation**.

###### 2.1 Without the introduction animation
```sh
npm run dev
```

###### 2.2 With the introduction animation
```sh
npm run dev -- --intro
```
