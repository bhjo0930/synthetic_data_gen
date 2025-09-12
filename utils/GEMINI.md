# Directory Overview

This directory contains data for a customer segmentation and personality analysis project. The primary goal is to analyze virtual user data, enrich it with lifestyle and MBTI personality classifications, and use this for further analysis.

## Key Files

*   **`Virtual_People_Data_20250820_1545.csv`**: The main dataset in CSV format, containing raw data about virtual individuals.
*   **`Virtual_People_Data_20250820_1545.xlsx`**: The same dataset in Excel format.
*   **`segment.xlsx`**: An Excel file containing segment definitions. This is likely used as a reference or lookup table to classify the individuals in the main dataset into predefined lifestyle or behavioral segments.

## Usage

The data in this directory is intended for data analysis and machine learning tasks. A typical workflow involves:

1.  Reading the `Virtual_People_Data` file.
2.  Using the `segment.xlsx` file to understand and apply customer segments.
3.  Performing data enrichment tasks, such as using a model to predict and populate the '라이프스타일' (Lifestyle) and '성격특성' (MBTI) columns.
4.  Saving the enriched data to a new file, such as `Virtual_People_Data_20250820_1545_CONV.xlsx`.

The ultimate goal is likely to gain insights into different customer segments for marketing, product development, or other business strategies.
