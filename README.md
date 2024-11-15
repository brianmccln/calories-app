# Meal Analysis App 🥗

This application allows users to upload an image of a meal and receive a detailed analysis, including the meal's name, preparation instructions, description, macronutrients (protein, fat, carbs), and optionally vitamins and minerals. The app leverages the OpenAI API to analyze meal data and provide a structured JSON response.

---

## Features

- **Image Upload**: Users can upload an image of a meal for analysis.
- **Optional Vitamins and Minerals Analysis**: Users can check the vitamins and minerals checkboxes to include detailed micronutrient information.
- **Detailed Meal Information**:
  - Name of the meal
  - Description of the meal
  - Preparation instructions
  - Total calories and calories per item
  - Macronutrient breakdown (protein, fat, carbohydrates)
  - Vitamins and minerals (if requested)
- **JSON Output Parsing**: The OpenAI API responds with a JSON object, which the app parses and displays in a user-friendly format.

---

## Workflow

1. **User Interaction**:
   - The user uploads a meal image and optionally selects the vitamins and minerals checkboxes.
   - The user clicks the "Send" button.

2. **Client-Side Processing**:
   - A `fetch()` request sends the image data and the boolean values for vitamins and minerals to the Python Flask backend.

3. **Flask Backend**:
   - Flask prepares a detailed prompt and sends the data to the OpenAI API, specifying the desired JSON response format.

4. **OpenAI API**:
   - The OpenAI API analyzes the data and responds with a structured JSON object containing the requested meal information.

5. **Response Handling**:
   - The Flask backend sends the API's JSON response back to the client.
   - The client-side JavaScript parses the JSON and dynamically displays the information in the appropriate HTML tags.

---

## Sample Output

### JSON Response (with Vitamins and Minerals Analysis)

```json
{
    "meal_name": "Grilled Chicken Salad",
    "description": "A light and refreshing grilled chicken salad with a citrus dressing.",
    "prep_instructions": "Grill the chicken, chop the vegetables, and mix with the dressing.",
    "total_calories": 400,
    "calories_per_item": [
        { "name": "Grilled chicken", "cals": 150 },
        { "name": "Lettuce", "cals": 20 },
        { "name": "Dressing", "cals": 80 }
    ],
    "grams_protein": 35,
    "grams_fat": 12,
    "grams_carbs": 30,
    "vitamins": {
        "A": { "mg": 0.5, "pct_rda": 10 },
        "C": { "mg": 30, "pct_rda": 50 },
        "D": { "mg": 1.0, "pct_rda": 20 }
    },
    "minerals": {
        "iron": { "mg": 2.0, "pct_rda": 25 },
        "magnesium": { "mg": 40.0, "pct_rda": 15 },
        "zinc": { "mg": 1.0, "pct_rda": 10 }
    }
}
