def get_all_files(repo, path):
    files = []
    contents = repo.get_contents(path)
    while contents:
        file = contents.pop(0)
        if file.type == "dir":
            contents.extend(repo.get_contents(file.path))
        else:
            files.append(file)
    return files