from asyncio.windows_events import NULL
from selenium.webdriver.firefox.options import Options
from selenium import webdriver
import pandas as pd
from time import sleep
import sys


def get_project_scores(project_name, port, login, mdp):
    print(project_name)
    driver = NULL
    success = False
    while(success == False):
        try:
            if(driver == NULL):
                try:
                    options = Options()
                    options.add_argument('--headless')
                    driver = webdriver.Firefox(options=options)
                except:
                    print("Can't launch the firefox driver")
                    driver = NULL
                    continue

            try:
                driver.get("http://localhost:"+str(port)+"/")
            except:
                print("Didn't recognize port")
                continue

            sleep(1)
            driver.find_element_by_id("login").send_keys(login)
            driver.find_element_by_id("password").send_keys(mdp)
            driver.find_element_by_class_name("button").click()
            print("connected to sonarqube ...")

            driver.get("http://localhost:"+str(port) +
                       "/dashboard?id="+project_name)
            sleep(1)
            elements = driver.find_elements_by_tag_name('a')

            l = []
            print("Getting scores of the project :")
            for e in elements:
                if(e.get_attribute('class') == "overview-measures-value text-light") or e.get_attribute('class') == 'link-no-underline':
                    l.append(e.text)

            print("Closing the driver ...\n")

            df = pd.DataFrame()

            my_dict = {'Name': project_name, 'Bugs': l[0], 'Bugs_Score': l[1], 'Vulnerabilities': l[2], 'Vulnerabilities_Score': l[3], 'Hotspots_Reviewed': l[4], 'Hotspots_Reviewed_Score': l[5],
                       'Debt': l[6], 'Code_Smells': l[7], 'Code_Smells_Score': l[8], 'Coverage': l[9], 'Lines': l[10], 'Duplicated_Blocks': l[11]}
            df = df.append(my_dict, ignore_index=True)
            success = True
            driver.close()
        except:
            print("Did not find all elements, retrying...")

    total_score = get_total_score(df.iloc[0]['Bugs_Score'], df.iloc[0]['Code_Smells_Score'],
                                  df.iloc[0]['Hotspots_Reviewed_Score'], df.iloc[0]['Vulnerabilities_Score'], float(df.iloc[0]['Lines'][:-1]))
    df['Total Score'] = total_score

    scores_l = []
    if (df.iloc[0]['Code_Smells_Score'] == 'A'):
        scores_l.append("Code Smells")
    if (df.iloc[0]['Bugs_Score'] == 'A'):
        scores_l.append("Bugs")
    if (df.iloc[0]['Vulnerabilities_Score'] == 'A'):
        scores_l.append("Vulnerabilities")
    if (df.iloc[0]['Hotspots_Reviewed_Score'] == 'A'):
        scores_l.append("Hotspots Reviewed")
    if (df.iloc[0]['Total Score'] == 100):
        scores_l.append("Perfect Score")
    if (df.iloc[0]['Lines'] == '0.0%'):
        scores_l.append("No duplications")

    df['Badges Score'] = '; '.join(scores_l)

    print("project : "+project_name, "\n", df.iloc[0])
    df.to_csv('gamicode.csv', index=False)
    return df


def get_total_score(bugs_s, code_s, hs_s, vuln_s, lines):
    bugs_s = get_note_to_score(bugs_s)
    code_s = get_note_to_score(code_s)
    hs_s = get_note_to_score(hs_s)
    vuln_s = get_note_to_score(vuln_s)
    if lines <= 10:
        lines = float((lines*2)+20)
    else:
        lines = 0
    return bugs_s+code_s+hs_s+vuln_s+lines


def get_note_to_score(note):
    return float(((4 - (ord(note) - 65))*20/4))


get_project_scores(sys.argv[1], 9000, "admin", "Robin2000")
