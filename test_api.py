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

            # Test users endpoint
            users_response = requests.get('http://127.0.0.1:8000/api/admin/users/', headers=headers)
            print(f"Users endpoint status: {users_response.status_code}")
            if users_response.status_code == 200:
                users_data = users_response.json()
                print(f"Nombre d'utilisateurs: {len(users_data)}")

            # Test promotions endpoint
            prom_response = requests.get('http://127.0.0.1:8000/api/admin/promotions/', headers=headers)
            print(f"Promotions endpoint status: {prom_response.status_code}")

            # Test professeurs endpoint
            prof_response = requests.get('http://127.0.0.1:8000/api/admin/professeurs/', headers=headers)
            print(f"Professeurs endpoint status: {prof_response.status_code}")

            # Test matieres endpoint
            mat_response = requests.get('http://127.0.0.1:8000/api/admin/matieres/', headers=headers)
            print(f"Matières endpoint status: {mat_response.status_code}")
        else:
            print("Aucun token dans la réponse")

    else:
        print(f"Erreur de connexion: {response.text}")

except Exception as e:
    print(f"Erreur: {e}")