import requests

# Test de connexion
login_url = 'http://127.0.0.1:8000/api/token/'
login_data = {'username': 'admin_demo', 'password': 'Demo123!'}

try:
    response = requests.post(login_url, json=login_data)
    print(f"Login status: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        if token:
            print(f"Token obtenu: {token[:20]}...")

            # Test des endpoints admin avec le token
            headers = {'Authorization': f'Bearer {token}'}

            # Test admin stats
            stats_response = requests.get('http://127.0.0.1:8000/api/admin/stats/', headers=headers)
            print(f"Admin stats status: {stats_response.status_code}")
            if stats_response.status_code == 200:
                print("Admin stats OK")
            else:
                print(f"Admin stats error: {stats_response.text}")

            # Test teacher dashboard (avec un token teacher)
            teacher_login = requests.post(login_url, json={'username': 'prof_dupont', 'password': 'Demo123!'})
            if teacher_login.status_code == 200:
                teacher_data = teacher_login.json()
                teacher_token = teacher_data.get('access')
                teacher_headers = {'Authorization': f'Bearer {teacher_token}'}

                # Test teacher dashboard
                teacher_dash = requests.get('http://127.0.0.1:8000/api/teacher/dashboard/', headers=teacher_headers)
                print(f"Teacher dashboard status: {teacher_dash.status_code}")

                # Test teacher subjects
                teacher_subjects = requests.get('http://127.0.0.1:8000/api/teacher/subjects/', headers=teacher_headers)
                print(f"Teacher subjects status: {teacher_subjects.status_code}")

        else:
            print("Aucun token dans la réponse")

    else:
        print(f"Erreur de connexion: {response.text}")

except Exception as e:
    print(f"Erreur: {e}")