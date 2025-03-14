# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| CATHELAND Martin | 345421 |
| DUCOURAU Maxime | 329544 |
| PERBET Jean | 341418 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

> 10% of the final grade

### Dataset

For this project, we selected the dataset **"Paris 2024 Olympic Summer Games"**, available on [Kaggle](https://www.kaggle.com/datasets/piterfm/paris-2024-olympic-summer-games). This dataset provides a rich and detailed compilation of data related to the Paris 2024 Summer Olympics, including athletes, events, medals, and schedules.

#### Dataset Structure

The dataset comprises multiple CSV files, each focusing on a specific aspect of the Olympic Games. Below is an overview of each file and its contents:

| **Table**                | **Description**                                         |
|--------------------------|---------------------------------------------------------|
| `athletes.csv`           | Personal information about all athletes                 |
| `coaches.csv`            | Personal information about all coaches                  |
| `events.csv`             | Details about all events that took place               |
| `medals.csv`             | All medal holders                                       |
| `medals_total.csv`       | Medal counts grouped by country                         |
| `medalists.csv`          | Information on all medalists                           |
| `nocs.csv`               | National Olympic Committees (NOCs) codes and countries |
| `schedule.csv`           | Day-by-day schedule of all events                      |
| `schedule_preliminary.csv` | Preliminary schedule of all events                  |
| `teams.csv`              | List of all teams participating in the Games           |
| `technical_officials.csv`| Technical officials (referees, judges, jury members)    |
| `results`                | Results of all events                                   |
| `torch_route.csv`        | Locations of the Olympic torch relay                   |
| `venues.csv`             | List of all Olympic venues                             |

#### Data Quality Assessment

The dataset is extensive, well-structured, making it highly suitable for visualization tasks without too much data wrangling operations (not the topic of the course). However, a careful review reveals a few points to consider:
- **Joining and integration**: Multiple files will need to be joined to create a more unified view for analysis (e.g., linking athletes to events or medals).
- **Potential missing values**: Certain fields (e.g., results or schedule details) may contain missing or incomplete data, requiring cleaning or imputation.
- **Categorical formatting**: Columns like `country` or `event` need attention to avoid inconsistencies when joining tables, but country codes are used in the dataset for standardization purposes.

Overall, the dataset provides an excellent quality baseline and is well-aligned with our objectives for producing meaningful visualizations.

#### Data Preprocessing Plan

Before starting visualization, the following preprocessing steps may be performed:
1. **Data Cleaning**:
   - Identify and handle missing or inconsistent values (e.g. `influence` or `philosophy` for athletes)
   - Standardize names, codes, and dates to improve readability on the website.
   - Handle different formats in columns (e.g. countries and names in medals `name`, when it is a country that won instead of a particular athlete)
2. **Data Integration**:
   - Merge tables where necessary (e.g., link athletes data with medals, events, NOCs, ...).
   - Restructure for specific analysis, such as computing  medal counts or event participation per country, per event, per capita (some potential ideas), and create new metrics.

#### Why This Dataset?

We chose this dataset because we are passionate about sports, and the Olympics were a pleasure to watch. It provides comprehensive data that allows for a wide variety of visualizations, from medal statistics to participation trends and event schedules. 

---

### Problematic

Our goal is to create an easy way to visualize the most important statistics about Paris 2024 Olympics. We thought about an **interactive map**, where users can navigate to discover the venues which welcomed Olympic trials. On click, each venue reveals information about the corresponding trial, althletes and countries. For instance, so as to get information about swimmers, one can navigate to *Paris La Défense Arena* and click the building, which will be displayed in 3D and highlighted.



#### Why This Visualization?

The Olympics are a huge source of information, and this would be a convenient way to access specific statistics.
- Users could explore Paris as the host city and visualize venues in detail.
- Clicking on a country flag show stats about this country at the Paris Olympics.
- Clicking on an athlete name opens a pop-up with detailed informations such as nicknames, philosophy and other (if available, of course).
- And many more options !

#### Target Audience

This visualization is designed for:
- **Olympics and sports fans** curious about various stats and venues,
- **Casual viewers** excited to explore Paris 2024,
- **Data and tech enthusiasts** interested in interactive tools.

#### What We’re Showing

- **Venue stats**: Explore Paris locations in 3D.
- **Country insights**: Discover medals and stats for specific nations.
- **Sport data**: Dive into performance details across Olympic sports.

---

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).


#### Originality of our approach

Unlike traditional medal tables and charts, our approach brings the Olympics to life with an **interactive 3D map** of Paris 2024 venues. Users can explore the city, click on venues, countries, and athletes to uncover stats, and see performances in their real-world context. This mix of **data storytelling and geospatial visualization** makes for a more engaging and intuitive experience.

#### Source of inspiration
- https://marseille.laphase5.com/fr - 3D Map with point of interests you can click to get more informations
- https://worldathletics.org/athletes/sweden/armand-duplantis-14679502 - Athlete page with key statistics and graphs




## Milestone 2 (18th April, 5pm)

**10% of the final grade**


## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

