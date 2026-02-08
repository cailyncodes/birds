import requests
from minject import inject


@inject.bind(session=requests.Session(), base_url="https://api.ebird.org/v2/")
class EBirdDAL:
    def __init__(self, session: requests.Session, base_url: str):
        self.session = session
        self.base_url = base_url

    def make_authenticated_request(
        self, url: str, auth: str, method: str = "GET", **kwargs
    ) -> requests.Response:
        """
        Make an authenticated request using stored cookies and Bearer token
        """
        headers = {"X-eBirdApiToken": auth}
        try:
            print(f"Making {method} request to: {url}")
            response = self.session.request(
                method=method, url=url, headers=headers, timeout=30, **kwargs
            )
            print(f"Request completed with status code: {response.status_code}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def get(self, endpoint: str, auth: str, **kwargs) -> requests.Response:
        """
        Make a GET request to the service
        """
        url = f"{self.base_url}{endpoint}"
        return self.make_authenticated_request(url, auth, "GET", **kwargs)

    def post(self, endpoint: str, auth: str, **kwargs) -> requests.Response:
        """
        Make a POST request to the service
        """
        url = f"{self.base_url}{endpoint}"
        return self.make_authenticated_request(url, auth, "POST", **kwargs)
