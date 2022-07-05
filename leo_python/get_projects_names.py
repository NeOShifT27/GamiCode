import pandas as pd
from sonarqube import SonarQubeClient
import sys
# return la liste des noms et la date d'analyse d'un pj


def get_projects_names(port: int, username, password):

    sonar = SonarQubeClient(sonarqube_url="http://localhost:" +
                            str(port), username=username, password=password)
    prjs = []
    projects = list(sonar.projects.search_projects())
    for p in projects:
        prjs.append([p["name"], p["lastAnalysisDate"]])

    return prjs


print(get_projects_names(9000, sys.argv[1], sys.argv[2]), end="")
