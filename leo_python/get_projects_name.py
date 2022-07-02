import pandas as pd
from sonarqube import SonarQubeClient

# return la liste des noms et la date d'analyse d'un pj


def get_projects_names(port: int, username, password):

    sonar = SonarQubeClient(sonarqube_url="http://localhost:" +
                            str(port), username=username, password=password)
    prjs = []
    projects = list(sonar.projects.search_projects())
    for p in projects:
        print(p)
        prjs.append([p["name"], p["lastAnalysisDate"]])

    return prjs


#get_projects_names(9000, 'admin', 'Robin2000')
