import json
from pathlib import Path

import streamlit as st

DB_PATH = Path(__file__).parent / "data" / "todos.json"
st.set_page_config(page_title="To-Do List", page_icon="✅")


def load_tasks():
    if not DB_PATH.exists():
        return []

    try:
        with DB_PATH.open("r", encoding="utf-8") as file:
            tasks = json.load(file)
        if isinstance(tasks, list):
            return tasks
    except (json.JSONDecodeError, OSError):
        pass

    return []


def save_tasks(tasks):
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DB_PATH.open("w", encoding="utf-8") as file:
        json.dump(tasks, file, indent=2)


if "tasks" not in st.session_state:
    st.session_state.tasks = load_tasks()

st.title("To-Do List")

new_task = st.text_input("Add a new task")
if st.button("Add task") and new_task.strip():
    st.session_state.tasks.append({"task": new_task.strip(), "done": False})
    save_tasks(st.session_state.tasks)
    st.rerun()

if st.session_state.tasks:
    st.subheader("Your tasks")

    for index, task in enumerate(st.session_state.tasks):
        col1, col2 = st.columns([5, 1])

        with col1:
            is_done = st.checkbox(task["task"], value=task["done"], key=f"checkbox_{index}")
            if is_done != task["done"]:
                st.session_state.tasks[index]["done"] = is_done
                save_tasks(st.session_state.tasks)
                st.rerun()

        with col2:
            if st.button("Delete", key=f"delete_{index}"):
                st.session_state.tasks.pop(index)
                save_tasks(st.session_state.tasks)
                st.rerun()

    if st.button("Clear completed"):
        st.session_state.tasks = [task for task in st.session_state.tasks if not task["done"]]
        save_tasks(st.session_state.tasks)
        st.rerun()
else:
    st.info("No tasks yet. Add one above.")
