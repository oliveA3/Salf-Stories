import os
import json


def save_order(order_list, repo):
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), ".."))
    local_path = os.path.join(project_root, "order.json")

    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(order_list, f, indent=2, ensure_ascii=False)

    try:
        order_file = repo.get_contents("order.json")
        repo.update_file(
            path="order.json",
            message="Update story order",
            content=json.dumps(order_list, indent=2),
            sha=order_file.sha
        )
    except Exception:
        repo.create_file(
            path="order.json",
            message="Create order.json",
            content=json.dumps(order_list, indent=2)
        )
