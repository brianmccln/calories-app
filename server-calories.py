from flask import Flask, render_template, request, jsonify
import tempfile
import openai
import json
import base64
import os
from dotenv import load_dotenv

# load the environment variable
load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("OPENAI_API_KEY")

client = openai.Client(api_key=API_KEY)

@app.route("/")
def index():
    return render_template("calorie-counter.html")

# route is hit when user at calorie-counter.html clicks Send Image btn
@app.route("/upload", methods=["POST"])
def upload():
    # extract the image and booleans from the form data
    image = request.files["image"]
    is_vitamins = request.form.get("isVitamins") == 'true'
    is_minerals = request.form.get("isMinerals") == 'true'
    print('Image File Name:', image.filename)
    print('is_vitamins:', is_vitamins)
    print('is_minerals:', is_minerals)
    # declare variables for is_vitamins / is_minerals prompts and JSON.
    # default starter value is empty string.. only if boolean is true
    # do we elaborate w details for the prompt
    is_vitamins_prompt = ""
    is_vitamins_json = ""
    # if bool is true, write prompts:
    if is_vitamins: # true only if True
        is_vitamins_prompt = "Also provide vitamins information as milligrams and percent of RDA. Vitamins to include are A, B Complex, C, D, among others. The exact vitamins are in the provided JSON structure."
        is_vitamins_json = """"vitamins": {
            "A": { "mg": "milligrams of vitamin A", "pct_rda": "percent RDA of vitamin A" },
            "B1": { "mg": "milligrams of vitamin B1 (thiamine)", "pct_rda": "percent RDA of vitamin B1" },
            "B2": { "mg": "milligrams of vitamin B2 (riboflavin)", "pct_rda": "percent RDA of vitamin B2" },
            "B3": { "mg": "milligrams of vitamin B3 (niacin)", "pct_rda": "percent RDA of vitamin B3" },
            "B5": { "mg": "milligrams of vitamin B5 (pantonthenic acid)", "pct_rda": "percent RDA of vitamin B5" },
            "B6": { "mg": "milligrams of vitamin B6 (pyridoxine)", "pct_rda": "percent RDA of vitamin B6" },
            "B7": { "mg": "milligrams of vitamin B7 (biotin)", "pct_rda": "percent RDA of vitamin B7" },
            "B9": { "mg": "milligrams of vitamin B9 (folic acid)", "pct_rda": "percent RDA of vitamin B9" },
            "B12": { "mg": "milligrams of vitamin B12 (cyanocobalamin)", "pct_rda": "percent RDA of vitamin B12" },
            "C": { "mg": "milligrams of vitamin C", "pct_rda": "percent RDA of vitamin C" },
            "D2": { "mg": "milligrams of vitamin D2 (ergocalciferol)", "pct_rda": "percent RDA of vitamin D2" },
            "D3": { "mg": "milligrams of vitamin D2 (cholecalciferol)", "pct_rda": "percent RDA of vitamin D3" },
            "E": { "mg": "milligrams of vitamin E (alpha-tocopherol)", "pct_rda": "percent RDA of vitamin E" },
        },"""
       
    is_minerals_prompt = ""
    is_minerals_json = ""
    # if bool is true, write prompts:
    if is_minerals:
        is_minerals_prompt = "Also provide information about mineral nutrients as milligrams and percent of RDA. Mineralss to include are iron, copper, zinc, potassium, magnesium, among others. The exact minerals are in the provided JSON structure."
        is_minerals_json = """"minerals": {
            "calcium": { "mg": "milligrams of calcium", "pct_rda": "percent RDA of calcium" },
            "chromium": { "mg": "milligrams of chromium", "pct_rda": "percent RDA of chromium" },
            "copper": { "mg": "milligrams of copper", "pct_rda": "percent RDA of copper" },
            "iodine": { "mg": "milligrams of iodine", "pct_rda": "percent RDA of iodine" },
            "iron": { "mg": "milligrams of iron", "pct_rda": "percent RDA of iron" },
            "magnesium": { "mg": "milligrams of magnesium", "pct_rda": "percent RDA of magnesium" },
            "manganese": { "mg": "milligrams of manganese", "pct_rda": "percent RDA of manganese" },
            "phosphorous": { "mg": "milligrams of phosphorous", "pct_rda": "percent RDA of phosphorous" },
            "potassium": { "mg": "milligrams of potassium", "pct_rda": "percent RDA of potassium" },
            "selenium": { "mg": "milligrams of selenium", "pct_rda": "percent RDA of selenium" },
            "sodium": { "mg": "milligrams of sodium", "pct_rda": "percent RDA of sodium" },
            "sulfur": { "mg": "milligrams of sulfur", "pct_rda": "percent RDA of sulfur" },
            "zinc": { "mg": "milligrams of zinc", "pct_rda": "percent RDA of zinc" },
        },"""

    # make a temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False)

    try:
        # print('temp_file.name:', temp_file.name)
        image.save(temp_file.name)
        image_path = temp_file.name
        # print('Image File Name:', image.filename)

        # load the image
        with open(image_path, "rb") as food_image:
            base64_food_image = base64.b64encode(food_image.read()).decode('utf-8')

        # send data to OpenAI API along w prompt
        response = client.chat.completions.create(
            model = "gpt-4o",
            response_format = {
                "type": "json_object"
            },
            messages = [
                {
                    "role": "system",
                    "content": f"""You are a dietician. A user sends you an image of a meal and you reply with a detailed analysis of the meal, including a restaurant menu-style name and description of the meal, total calories in the meal, the number of calories per food item in the meal, and a breakdown of macronutrients, as grams of protein, fat and carbohydtrates. Also give some concise prep instructions as a string of text. The calories per food item should be provided as a list of key-value pairs, with the key being the name. {is_vitamins_prompt} {is_minerals_prompt} Here is the precise JSON format that you need to use:
                    {{ 
                        "meal_name": "name of meal",
                        "description": "savory description of meal",
                        "prep_instructions": "prep instructions as a string of text",
                        "total_calories": "total calories in the meal as integer",
                        "calories_per_item": [
                            {{ "name": "name of food item", "cals": "number of calories in item" }},
                            {{ "name": "name of food item", "cals": "number of calories in item" }},
                            {{ "name": "name of food item", "cals": "number of calories in item" }},
                        ],
                        "grams_protein": "number of grams of protein in the meal",
                        "grams_fat": "number of grams of fat in the meal",
                        "grams_carbs": "number of grams of carbohydrates in the meal",
                        {is_vitamins_json} 
                        {is_minerals_json} 
                    }}"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Provide information in JSON format about this meal, according to the provided instructions."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_food_image}"
                            }
                        },
                        
                    ]
                }
            ]
        )
        meal_info = response.choices[0].message.content
        print('meal_info:', meal_info)
        return json.loads(meal_info)
    finally:
        os.remove(temp_file.name)

if __name__ == "__main__":
    app.run(debug=True)