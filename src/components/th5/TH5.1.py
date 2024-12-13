import pandas as pd

# Reload the previously created Excel file
file_path = "TH5.3.xlsx"
df = pd.read_excel(file_path)

# Function to calculate probabilities for Naive Bayes without Laplace smoothing
def calculate_probabilities(data, conditions, target_class):
    subset = data[data["Lớp"] == target_class]
    total_count = len(subset)
    probabilities = {}
    for column, value in conditions.items():
        condition_count = len(subset[subset[column] == value])
        probabilities[column] = condition_count / total_count if total_count > 0 else 0
    overall_probability = total_count / len(data)
    return probabilities, overall_probability

# Define the instances X1, X2, X3
instances = [
    {"Thời tiết": "nắng", "Độ ẩm": "cao"},
    {"Thời tiết": "nắng", "Độ ẩm": "vừa"},
    {"Thời tiết": "u ám"}
]

# Calculate probabilities for each instance
results = []
for instance in instances:
    class_probabilities = {}
    for target_class in df["Lớp"].unique():
        probabilities, overall_probability = calculate_probabilities(df, instance, target_class)
        combined_probability = overall_probability
        for prob in probabilities.values():
            combined_probability *= prob
        class_probabilities[target_class] = combined_probability
    results.append(class_probabilities)

# Convert results to a DataFrame for easier visualization
results_df = pd.DataFrame(results, index=["X1", "X2", "X3"])

# Display the results
print(results_df)