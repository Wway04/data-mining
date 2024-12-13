import pandas as pd

# Reload the previously created Excel file
file_path = "weather_data.xlsx"
df = pd.read_excel(file_path)

# Function to calculate probabilities for Naive Bayes with Laplace smoothing
def calculate_probabilities(data, conditions, target_class):
    subset = data[data["Lớp"] == target_class]
    total_count = len(subset)
    total_classes = len(data["Lớp"].unique())
    probabilities = {}
    
    for column, value in conditions.items():
        # Count occurrences of the value for the given attribute in the subset
        condition_count = len(subset[subset[column] == value])
        # Apply Laplace smoothing: (count + 1) / (total + number of unique values in column)
        unique_values_count = len(data[column].unique())
        probabilities[column] = (condition_count + 1) / (total_count + unique_values_count)
    
    # Calculate the prior probability of the class (with Laplace smoothing)
    overall_probability = (total_count + 1) / (len(data) + total_classes)
    
    return probabilities, overall_probability

# Define the instances X1, X2, X3
instances = [
    {"Thời tiết": "nắng", "Độ ẩm": "cao"},
    {"Thời tiết": "nắng", "Độ ẩm": "vừa"},
    {"Thời tiết": "u ám"}
]

# Calculate probabilities for each instance with Laplace smoothing
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
