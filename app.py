from flask import Flask, request, send_from_directory, request, jsonify, render_template
from github import Github, Auth
import os
import json
import re
from dotenv import load_dotenv
from utils.order import save_order
from utils.get_files import get_all_files
from utils.save_story import generate_and_save_story

load_dotenv()

app = Flask(__name__, template_folder="templates", static_folder="static")

# GITHUB VARIABLES
auth = Auth.Token(os.environ["GITHUB_TOKEN"])
g = Github(auth=auth)
repo = g.get_repo("oliveA3/Salf-Stories")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)


# LOADING EXISTING STORIES
@app.route("/stories_list")
def stories_list():
    files = get_all_files(repo, "stories")
    all_files = [f.name for f in files if f.name.endswith(".docx")]

    try:
        order_file = repo.get_contents("order.json")
        order_json = order_file.decoded_content.decode("utf-8")
        ordered_files = json.loads(order_json)
        ordered_files = [
            f + ".docx" for f in ordered_files if f + ".docx" in all_files]
        unordered_files = [f for f in all_files if f not in ordered_files]
        final_order = ordered_files + unordered_files
    except:
        final_order = all_files

    stories = []
    for file in files:
        if file.name in final_order:
            stories.append({
                "name": file.name,
                "url": file.download_url
            })

    stories.sort(key=lambda x: final_order.index(x["name"]))
    return jsonify(stories)


# UPLOAD NEW STORY AS A .DOCX FILE
@app.route("/new_story", methods=["GET"])
def new_story_page():
    return render_template("new_story.html")


@app.route("/new_story", methods=["POST"])
def new_story():
    title = request.form.get("title")
    content = request.form.get("content")

    if not title or not content:
        return jsonify({"error": "Missing title or content"}), 400

    generate_and_save_story(title, content, repo, update=False)

    try:
        order_file = repo.get_contents("order.json")
        order_list = json.loads(order_file.decoded_content.decode("utf-8"))
    except:
        order_list = []

    if title not in order_list:
        order_list.append(title)
        save_order(order_list, repo)

    return jsonify({"message": f"New story '{title}' uploaded and added to order.json"})


# EDIT STORY AS A .DOCX FILE
@app.route("/edit_story")
def edit_story_page():
    title = request.args.get("title")
    if not title:
        return "Missing story title", 400
    return render_template("edit_story.html", title=title)


@app.route("/edit_story", methods=["POST"])
def edit_story():
    title = request.form.get("title")
    content = request.form.get("content")

    if not title or not content:
        return jsonify({"error": "Missing title or content"}), 400

    try:
        generate_and_save_story(title, content, repo, update=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": f"Story '{title}' updated successfully"})


# SAVING NEW ORDER
@app.route("/save_order", methods=["POST"])
def save_order_route():
    new_order = request.json.get("order", [])

    try:
        save_order(new_order, repo)
        return jsonify({"message": "Order updated locally and on GitHub"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/stories/<path:filename>")
def serve_story(filename):
    return send_from_directory('stories', filename)


if __name__ == "__main__":
    app.run(debug=True)
