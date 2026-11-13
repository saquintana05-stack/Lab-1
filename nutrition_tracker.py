import json
from datetime import date
from pathlib import Path
from uuid import uuid4

import pandas as pd
import streamlit as st

DB_PATH = Path(__file__).parent / "data" / "food_log.json"
NUTRIENTS = ("Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Fiber (g)")

st.set_page_config(page_title="Daily Food Log", page_icon="🥗", layout="wide")


def load_entries():
    if not DB_PATH.exists():
        return []

    try:
        with DB_PATH.open("r", encoding="utf-8") as file:
            entries = json.load(file)
    except (json.JSONDecodeError, OSError):
        st.error("The food log could not be read. Check data/food_log.json before editing it.")
        st.stop()

    if not isinstance(entries, list):
        st.error("The food log must contain a JSON list.")
        st.stop()
    return entries


def save_entries(entries):
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DB_PATH.open("w", encoding="utf-8") as file:
        json.dump(entries, file, indent=2)


def daily_totals(entries):
    return {
        "Calories": sum(entry["calories"] for entry in entries),
        "Protein (g)": sum(entry["protein"] for entry in entries),
        "Carbs (g)": sum(entry["carbs"] for entry in entries),
        "Fat (g)": sum(entry["fat"] for entry in entries),
        "Fiber (g)": sum(entry["fiber"] for entry in entries),
    }


st.title("Daily Food Log")
st.caption("Log what you eat and review your daily nutrition totals.")

entries = load_entries()
selected_date = st.date_input("Log date", value=date.today())
day_entries = [entry for entry in entries if entry["date"] == selected_date.isoformat()]
totals = daily_totals(day_entries)

st.subheader("Daily totals")
metric_columns = st.columns(len(NUTRIENTS))
for column, nutrient in zip(metric_columns, NUTRIENTS):
    value = totals[nutrient]
    formatted = f"{value:,.0f}" if nutrient == "Calories" else f"{value:,.1f} g"
    column.metric(nutrient, formatted)

st.subheader("Add food")
with st.form("add_food_form", clear_on_submit=True):
    food_col, meal_col = st.columns([3, 2])
    food_name = food_col.text_input("Food or drink")
    meal = meal_col.selectbox("Meal", ["Breakfast", "Lunch", "Dinner", "Snack"])

    calories_col, protein_col, carbs_col, fat_col, fiber_col = st.columns(5)
    calories = calories_col.number_input("Calories", min_value=0, step=10)
    protein = protein_col.number_input("Protein (g)", min_value=0.0, step=1.0)
    carbs = carbs_col.number_input("Carbs (g)", min_value=0.0, step=1.0)
    fat = fat_col.number_input("Fat (g)", min_value=0.0, step=1.0)
    fiber = fiber_col.number_input("Fiber (g)", min_value=0.0, step=1.0)
    submitted = st.form_submit_button("Add to food log", type="primary")

if submitted:
    if not food_name.strip():
        st.warning("Enter a food or drink name first.")
    else:
        entries.append(
            {
                "id": str(uuid4()),
                "date": selected_date.isoformat(),
                "meal": meal,
                "food": food_name.strip(),
                "calories": int(calories),
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
                "fiber": fiber,
            }
        )
        save_entries(entries)
        st.rerun()

st.subheader(f"Food log for {selected_date.strftime('%B %d, %Y')}")
if day_entries:
    for entry in day_entries:
        row_columns = st.columns([2, 3, 1, 1, 1, 1, 1, 1])
        row_columns[0].write(entry["meal"])
        row_columns[1].write(entry["food"])
        row_columns[2].write(f"{entry['calories']} kcal")
        row_columns[3].write(f"P {entry['protein']:g}g")
        row_columns[4].write(f"C {entry['carbs']:g}g")
        row_columns[5].write(f"F {entry['fat']:g}g")
        row_columns[6].write(f"Fiber {entry['fiber']:g}g")
        if row_columns[7].button("Delete", key=f"delete_{entry['id']}", help="Delete this food entry"):
            entries = [saved for saved in entries if saved["id"] != entry["id"]]
            save_entries(entries)
            st.rerun()
else:
    st.info("No foods logged for this day yet.")

if entries:
    st.subheader("Recent days")
    history_rows = []
    for logged_date in sorted({entry["date"] for entry in entries}, reverse=True)[:7]:
        date_entries = [entry for entry in entries if entry["date"] == logged_date]
        history_rows.append({"Date": logged_date, **daily_totals(date_entries)})

    history = pd.DataFrame(history_rows).sort_values("Date")
    st.bar_chart(history.set_index("Date")["Calories"], y_label="Calories")
    st.dataframe(history.sort_values("Date", ascending=False), hide_index=True, use_container_width=True)
